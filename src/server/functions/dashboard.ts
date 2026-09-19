import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { orders, order_items, reviews, templates, template_downloads, all_access_passes } from '../db/schema'
import { eq, and, desc, inArray, count } from 'drizzle-orm'
import { requireUser } from '../admin'

export const getPurchasedTemplates = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const reviewRows = await db.select({ template_id: reviews.template_id }).from(reviews).where(eq(reviews.user_id, user.id))
  const reviewedSet = new Set(reviewRows.map((r) => r.template_id))
  const pass = (await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1))[0]

  if (pass) {
    const all = await db.select().from(templates)
    const downloads = await db.select().from(template_downloads)
    const fileMap = new Map(downloads.map((d) => [d.template_id, d.source_file_url]))
    return all.map((t) => ({
      id: `pass-${t.id}`,
      template_id: t.id,
      template_title: t.title,
      license_type: 'pass',
      price: 0,
      purchased_at: pass.created_at.toISOString(),
      order_id: `pass-${pass.id}`,
      order_status: 'completed',
      source_file_url: fileMap.get(t.id) ?? null,
      has_review: reviewedSet.has(t.id),
    }))
  }

  const completedOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.user_id, user.id), eq(orders.status, 'completed')))
    .orderBy(desc(orders.created_at))
  if (completedOrders.length === 0) return []
  const orderIds = completedOrders.map((o) => o.id)
  const items = await db.select().from(order_items).where(inArray(order_items.order_id, orderIds))
  const templateIds = [...new Set(items.map((i) => i.template_id))]
  const downloads = templateIds.length
    ? await db.select().from(template_downloads).where(inArray(template_downloads.template_id, templateIds))
    : []
  const fileMap = new Map(downloads.map((d) => [d.template_id, d.source_file_url]))
  const orderMap = new Map(completedOrders.map((o) => [o.id, o]))
  return items.map((item) => ({
    id: item.id,
    template_id: item.template_id,
    template_title: item.template_title,
    license_type: item.license_type,
    price: item.price,
    purchased_at: orderMap.get(item.order_id)?.created_at.toISOString() ?? item.created_at.toISOString(),
    order_id: item.order_id,
    order_status: orderMap.get(item.order_id)?.status ?? 'completed',
    source_file_url: fileMap.get(item.template_id) ?? null,
    has_review: reviewedSet.has(item.template_id),
  }))
})

export const getTemplateDownloadUrl = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    const pass = (await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1))[0]
    let hasAccess = !!pass
    if (!hasAccess) {
      const items = await db.select({ order_id: order_items.order_id }).from(order_items).where(eq(order_items.template_id, templateId))
      const orderIds = items.map((i) => i.order_id)
      if (orderIds.length) {
        const completed = await db
          .select()
          .from(orders)
          .where(and(inArray(orders.id, orderIds), eq(orders.user_id, user.id), eq(orders.status, 'completed')))
          .limit(1)
        hasAccess = completed.length > 0
      }
    }
    if (!hasAccess) return null
    const row = (await db.select().from(template_downloads).where(eq(template_downloads.template_id, templateId)).limit(1))[0]
    return row ? { source_file_url: row.source_file_url } : null
  })

export const getOrderItemsWithDownloads = createServerFn({ method: 'GET' })
  .validator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    await requireUser()
    const items = await db.select().from(order_items).where(eq(order_items.order_id, orderId))
    const templateIds = items.map((i) => i.template_id)
    const downloads = templateIds.length
      ? await db.select().from(template_downloads).where(inArray(template_downloads.template_id, templateIds))
      : []
    const fileMap = new Map(downloads.map((d) => [d.template_id, d.source_file_url]))
    return items.map((item) => ({ ...item, source_file_url: fileMap.get(item.template_id) ?? null }))
  })

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const orderRows = await db.select().from(orders).where(eq(orders.user_id, user.id))
  const completed = orderRows.filter((o) => o.status === 'completed')
  const totalSpent = completed.reduce((s, o) => s + Number(o.total_amount), 0)
  const completedIds = completed.map((o) => o.id)
  const itemRows = completedIds.length
    ? await db.select().from(order_items).where(inArray(order_items.order_id, completedIds))
    : []
  const purchasedIds = new Set(itemRows.map((i) => i.template_id))
  const reviewRows = await db.select({ template_id: reviews.template_id }).from(reviews).where(eq(reviews.user_id, user.id))
  const reviewedIds = new Set(reviewRows.map((r) => r.template_id))
  const pendingReviews = [...purchasedIds].filter((id) => !reviewedIds.has(id)).length
  const [{ value: catalogCount }] = await db.select({ value: count() }).from(templates)
  const pass = (await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, user.id)).limit(1))[0]
  return {
    totalOrders: orderRows.length,
    totalSpent,
    totalDownloads: pass ? (catalogCount ?? 0) : purchasedIds.size,
    pendingReviews: pass ? 0 : pendingReviews,
  }
})
