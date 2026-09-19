import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { reviews, profiles, order_items, orders, all_access_passes, templates } from '../db/schema'
import { eq, and, desc, count, inArray } from 'drizzle-orm'
import { requireUser } from '../admin'

export const listReviews = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.template_id, templateId), eq(reviews.status, 'approved')))
      .orderBy(desc(reviews.created_at))
    const userIds = [...new Set(rows.map((r) => r.user_id))]
    const profileRows = userIds.length
      ? await db.select().from(profiles).where(inArray(profiles.user_id, userIds))
      : []
    const profileMap = new Map(profileRows.map((p) => [p.user_id, p]))
    return rows.map((r) => ({
      ...r,
      display_name: profileMap.get(r.user_id)?.display_name || 'Anonymous',
      avatar_url: profileMap.get(r.user_id)?.avatar_url || null,
    }))
  })

async function recalcReviewCount(templateId: string) {
  const [{ value: c }] = await db
    .select({ value: count() })
    .from(reviews)
    .where(and(eq(reviews.template_id, templateId), eq(reviews.status, 'approved')))
  await db.update(templates).set({ review_count: c }).where(eq(templates.id, templateId))
}

async function hasPurchasedInternal(userId: string, templateId: string) {
  const pass = await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, userId)).limit(1)
  if (pass.length > 0) return true
  const items = await db.select({ order_id: order_items.order_id }).from(order_items).where(eq(order_items.template_id, templateId))
  if (items.length === 0) return false
  const orderIds = items.map((i) => i.order_id)
  const completed = await db
    .select()
    .from(orders)
    .where(and(inArray(orders.id, orderIds), eq(orders.user_id, userId), eq(orders.status, 'completed')))
    .limit(1)
  return completed.length > 0
}

export const getUserReview = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.template_id, templateId), eq(reviews.user_id, user.id)))
      .limit(1)
    return rows[0] ?? null
  })

export const hasPurchased = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    return hasPurchasedInternal(user.id, templateId)
  })

export const submitReview = createServerFn({ method: 'POST' })
  .validator((v: { templateId: string; rating: number; comment: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    if (!(await hasPurchasedInternal(user.id, data.templateId))) {
      throw new Error('You must purchase this template before reviewing')
    }
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.template_id, data.templateId), eq(reviews.user_id, user.id)))
      .limit(1)
    if (existing.length > 0) {
      await db
        .update(reviews)
        .set({ rating: data.rating, comment: data.comment.trim() || null, status: 'pending', updated_at: new Date() })
        .where(eq(reviews.id, existing[0].id))
    } else {
      await db.insert(reviews).values({
        user_id: user.id,
        template_id: data.templateId,
        rating: data.rating,
        comment: data.comment.trim() || null,
        status: 'pending',
      })
    }
    await recalcReviewCount(data.templateId)
    return { success: true }
  })

export const deleteReview = createServerFn({ method: 'POST' })
  .validator((v: { reviewId: string; templateId: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db.delete(reviews).where(and(eq(reviews.id, data.reviewId), eq(reviews.user_id, user.id)))
    await recalcReviewCount(data.templateId)
    return { success: true }
  })
