import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import {
  templates,
  orders,
  order_items,
  all_access_passes,
  coupons,
  contacts,
  notifications,
  site_settings,
} from '../db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { requireUser } from '../admin'
import { paypalAccessToken, PAYPAL_API } from './paypal'
import { issueKeysForOrder } from './licenses'

const ALL_ACCESS_PRICE = 300

interface CartItem {
  id: string
  license: string
}

async function computeTotal(items: CartItem[]) {
  const ids = items.map((i) => i.id)
  const rows = await db.select().from(templates).where(inArray(templates.id, ids))
  const map = new Map(rows.map((t) => [t.id, t]))
  let total = 0
  const verified: { id: string; title: string; license: string; price: number }[] = []
  for (const item of items) {
    const t = map.get(item.id)
    if (!t) throw new Error(`Template not found: ${item.id}`)
    const price = item.license === 'extended' && t.extended_price ? t.extended_price : t.price
    total += price
    verified.push({ id: t.id, title: t.title, license: item.license || 'regular', price })
  }
  return { total, verified }
}

async function applyCoupon(code: string | undefined, total: number) {
  if (!code) return { discount: 0, coupon: null as any }
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase().trim())).limit(1)
  const coupon = rows[0]
  if (!coupon || !coupon.is_active) return { discount: 0, coupon: null }
  if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) return { discount: 0, coupon: null }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return { discount: 0, coupon: null }
  if (coupon.min_order_amount != null && total < coupon.min_order_amount) return { discount: 0, coupon: null }
  const discount = coupon.discount_type === 'percentage' ? (total * coupon.discount_value) / 100 : coupon.discount_value
  return { discount, coupon }
}

async function incrementSales(templateId: string) {
  const [t] = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1)
  await db.update(templates).set({ sales: (t?.sales ?? 0) + 1 }).where(eq(templates.id, templateId))
}

export const createPayPalOrder = createServerFn({ method: 'POST' })
  .validator((v: { items: CartItem[]; isAllAccess?: boolean; couponCode?: string; isProHosting?: boolean; templateTitle?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    let serverTotal = 0
    let paypalItems: any[] = []
    if (data.isProHosting) {
      const setting = (await db.select().from(site_settings).where(eq(site_settings.key, 'hosting_platforms')).limit(1))[0]
      const proPrice = (setting?.value as any)?.pro_service?.price ?? 0
      serverTotal = proPrice
      paypalItems = [
        {
          name: ('Pro Hosting Service' + (data.templateTitle ? ` - ${data.templateTitle}` : '')).substring(0, 120),
          quantity: '1',
          unit_amount: { currency_code: 'USD', value: proPrice.toFixed(2) },
          category: 'DIGITAL_GOODS',
        },
      ]
    } else if (data.isAllAccess) {
      serverTotal = ALL_ACCESS_PRICE
      paypalItems = [
        {
          name: 'All Access Pass',
          quantity: '1',
          unit_amount: { currency_code: 'USD', value: ALL_ACCESS_PRICE.toFixed(2) },
          category: 'DIGITAL_GOODS',
        },
      ]
    } else {
      if (!data.items?.length) throw new Error('Cart is empty')
      const { total, verified } = await computeTotal(data.items)
      serverTotal = total
      paypalItems = verified.map((v) => ({
        name: v.title.substring(0, 120),
        quantity: '1',
        unit_amount: { currency_code: 'USD', value: '' },
        category: 'DIGITAL_GOODS',
      }))
    }
    if (data.couponCode && !data.isProHosting) {
      const { discount } = await applyCoupon(data.couponCode, serverTotal)
      serverTotal = Math.max(0, serverTotal - discount)
    }
    if (serverTotal <= 0) throw new Error('Order total is $0.00. No payment required.')
    const perItemValue = (serverTotal / paypalItems.length).toFixed(2)
    let runningTotal = 0
    for (let i = 0; i < paypalItems.length; i++) {
      if (i === paypalItems.length - 1) {
        paypalItems[i].unit_amount.value = (serverTotal - runningTotal).toFixed(2)
      } else {
        paypalItems[i].unit_amount.value = perItemValue
        runningTotal += parseFloat(perItemValue)
      }
    }
    const token = await paypalAccessToken()
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: serverTotal.toFixed(2),
              breakdown: { item_total: { currency_code: 'USD', value: serverTotal.toFixed(2) } },
            },
            items: paypalItems,
          },
        ],
        application_context: { brand_name: 'Template Marketplace', shipping_preference: 'NO_SHIPPING' },
      }),
    })
    const orderData = await res.json()
    if (!res.ok) throw new Error(`PayPal Order Rejected: ${orderData.details?.[0]?.issue || orderData.message}`)
    return { orderId: orderData.id, userId: user.id, userEmail: user.email }
  })

export const capturePayPalOrder = createServerFn({ method: 'POST' })
  .validator((v: { paypalOrderId: string; items: CartItem[]; isAllAccess?: boolean; couponCode?: string; isProHosting?: boolean; templateTitle?: string; proHostingNotes?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const existing = (await db.select().from(orders).where(eq(orders.paypal_order_id, data.paypalOrderId)).limit(1))[0]
    if (existing) return { success: true, orderId: existing.id, paypalOrderId: data.paypalOrderId, alreadyProcessed: true }

    let serverTotal = 0
    let verified: { id: string; title: string; license: string; price: number }[] = []
    if (data.isProHosting) {
      const setting = (await db.select().from(site_settings).where(eq(site_settings.key, 'hosting_platforms')).limit(1))[0]
      serverTotal = (setting?.value as any)?.pro_service?.price ?? 0
    } else if (data.isAllAccess) {
      serverTotal = ALL_ACCESS_PRICE
    } else {
      if (!data.items?.length) throw new Error('Cart is empty')
      const r = await computeTotal(data.items)
      serverTotal = r.total
      verified = r.verified
    }
    let discount = 0
    let couponData: any = null
    if (data.couponCode && !data.isProHosting) {
      const r = await applyCoupon(data.couponCode, serverTotal)
      discount = r.discount
      couponData = r.coupon
    }
    const totalAfterDiscount = Math.max(0, serverTotal - discount)

    const token = await paypalAccessToken()
    const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${data.paypalOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const verifyData = await verifyRes.json()
    if (!verifyRes.ok) throw new Error(`PayPal Verify Error: ${verifyData.message}`)
    const paypalAmount = parseFloat(verifyData.purchase_units?.[0]?.amount?.value || '0')
    if (Math.abs(paypalAmount - parseFloat(totalAfterDiscount.toFixed(2))) > 0.01) {
      throw new Error(`Amount mismatch. PayPal: ${paypalAmount}, Server: ${totalAfterDiscount.toFixed(2)}`)
    }

    const [order] = await db
      .insert(orders)
      .values({ user_id: user.id, user_email: user.email, total_amount: totalAfterDiscount, status: 'pending', paypal_order_id: data.paypalOrderId })
      .returning()

    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${data.paypalOrderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
    const captureData = await captureRes.json()
    if (!captureRes.ok) {
      await db.update(orders).set({ status: 'cancelled' }).where(eq(orders.id, order.id))
      throw new Error(`PayPal Capture Rejected: ${captureData.details?.[0]?.issue || captureData.message}`)
    }

    if (couponData && discount > 0) {
      await db.update(coupons).set({ used_count: couponData.used_count + 1 }).where(eq(coupons.id, couponData.id))
    }
    await db.update(orders).set({ status: 'completed' }).where(eq(orders.id, order.id))

    if (data.isProHosting) {
      const contactMessage = `Pro Hosting Service purchased.\n\nTemplate: ${data.templateTitle || 'Not specified'}\nUser Notes: ${data.proHostingNotes || 'None'}\nOrder ID: ${order.id}\nAmount Paid: $${totalAfterDiscount}`
      await db.insert(contacts).values({
        name: user.email,
        email: user.email,
        subject: `Pro Hosting Request${data.templateTitle ? ` - ${data.templateTitle}` : ''}`,
        message: contactMessage,
      })
      await db.insert(notifications).values({
        user_id: user.id,
        type: 'pro_hosting',
        title: 'Pro Hosting Request Received',
        message: "We've received your pro hosting request and will contact you within 24 hours.",
        metadata: { order_id: order.id, template_title: data.templateTitle },
      })
    } else if (data.isAllAccess) {
      await db.insert(all_access_passes).values({ user_id: user.id, order_id: order.id, price: totalAfterDiscount })
    } else {
      await db.insert(order_items).values(
        verified.map((item) => ({
          order_id: order.id,
          template_id: item.id,
          template_title: item.title,
          license_type: item.license,
          price: item.price,
        })),
      )
      for (const v of verified) await incrementSales(v.id)
      await issueKeysForOrder(order.id)
    }
    return { success: true, orderId: order.id, paypalOrderId: captureData.id }
  })

export const claimFreeOrder = createServerFn({ method: 'POST' })
  .validator((v: { items: CartItem[]; couponCode?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!data.items?.length) throw new Error('Cart is empty')
    const { total, verified } = await computeTotal(data.items)
    let discount = 0
    let couponData: any = null
    if (data.couponCode) {
      const r = await applyCoupon(data.couponCode, total)
      discount = r.discount
      couponData = r.coupon
    }
    const totalAfterDiscount = Math.max(0, total - discount)
    if (totalAfterDiscount > 0) {
      throw new Error('This endpoint only accepts free ($0.00) orders. Paid orders must go through PayPal.')
    }
    const [order] = await db
      .insert(orders)
      .values({ user_id: user.id, user_email: user.email, total_amount: totalAfterDiscount, status: 'completed', paypal_order_id: null })
      .returning()
    if (couponData && discount > 0) {
      await db.update(coupons).set({ used_count: couponData.used_count + 1 }).where(eq(coupons.id, couponData.id))
    }
    await db.insert(order_items).values(
      verified.map((item) => ({
        order_id: order.id,
        template_id: item.id,
        template_title: item.title,
        license_type: item.license,
        price: item.price,
      })),
    )
    for (const v of verified) await incrementSales(v.id)
    await issueKeysForOrder(order.id)
    return { success: true, orderId: order.id, free: true }
  })

export const removePurchasedTemplate = createServerFn({ method: 'POST' })
  .validator((itemId: string) => itemId)
  .handler(async ({ data: itemId }) => {
    const user = await requireUser()
    const item = (await db.select().from(order_items).where(eq(order_items.id, itemId)).limit(1))[0]
    if (!item) throw new Error('Order item not found')
    const order = (await db.select().from(orders).where(eq(orders.id, item.order_id)).limit(1))[0]
    if (!order || order.user_id !== user.id) throw new Error('You do not own this order item')
    await db.delete(order_items).where(eq(order_items.id, itemId))
    return { success: true }
  })

export const getMyOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return db.select().from(orders).where(eq(orders.user_id, user.id)).orderBy(desc(orders.created_at))
})

export const getOrderWithItems = createServerFn({ method: 'GET' })
  .validator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    await requireUser()
    const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0]
    if (!order) throw new Error('Order not found')
    const items = await db.select().from(order_items).where(eq(order_items.order_id, orderId))
    return { ...order, items }
  })

export const hasAllAccessPass = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1)
  return rows[0] ?? null
})
