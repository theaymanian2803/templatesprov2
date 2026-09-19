import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { coupons } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../admin'

export const listCoupons = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(coupons).orderBy(desc(coupons.created_at))
})

export const createCoupon = createServerFn({ method: 'POST' })
  .validator((c: { code: string; discount_type?: string; discount_value?: number; min_order_amount?: number; max_uses?: number | null; is_active?: boolean; expires_at?: string | null }) => c)
  .handler(async ({ data }) => {
    await requireAdmin()
    const [row] = await db
      .insert(coupons)
      .values({
        code: data.code.toUpperCase().trim(),
        discount_type: (data.discount_type as any) || 'percentage',
        discount_value: data.discount_value || 0,
        min_order_amount: data.min_order_amount || 0,
        max_uses: data.max_uses || null,
        is_active: data.is_active ?? true,
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
      })
      .returning()
    return row
  })

export const deleteCoupon = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await db.delete(coupons).where(eq(coupons.id, id))
    return { success: true }
  })

export const toggleCoupon = createServerFn({ method: 'POST' })
  .validator((v: { id: string; is_active: boolean }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.update(coupons).set({ is_active: data.is_active }).where(eq(coupons.id, data.id))
    return { success: true }
  })

export const validateCoupon = createServerFn({ method: 'POST' })
  .validator((v: { code: string; orderTotal: number }) => v)
  .handler(async ({ data }) => {
    const rows = await db.select().from(coupons).where(eq(coupons.code, data.code.toUpperCase().trim())).limit(1)
    const coupon = rows[0]
    if (!coupon || !coupon.is_active) throw new Error('Coupon not found or inactive')
    if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) throw new Error('Coupon has expired')
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) throw new Error('Coupon usage limit reached')
    if (coupon.min_order_amount != null && data.orderTotal < coupon.min_order_amount) throw new Error('Order does not meet minimum amount')
    const discount =
      coupon.discount_type === 'percentage'
        ? (data.orderTotal * coupon.discount_value) / 100
        : coupon.discount_value
    return {
      coupon: { code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value },
      discount: Math.round(discount * 100) / 100,
    }
  })
