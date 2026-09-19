import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { refund_requests, orders } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAdmin, requireUser, isAdmin } from '../admin'

export const createRefundRequest = createServerFn({ method: 'POST' })
  .validator((v: { orderId: string; reason: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    const order = (
      await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, data.orderId), eq(orders.user_id, user.id)))
        .limit(1)
    )[0]
    if (!order || order.status !== 'completed') throw new Error('Order not found or not completed')
    await db.insert(refund_requests).values({ order_id: data.orderId, user_id: user.id, reason: data.reason })
    return { success: true }
  })

export const listRefundRequests = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  if (await isAdmin(user.id)) {
    return db.select().from(refund_requests).orderBy(desc(refund_requests.created_at))
  }
  return db
    .select()
    .from(refund_requests)
    .where(eq(refund_requests.user_id, user.id))
    .orderBy(desc(refund_requests.created_at))
})

export const updateRefundRequest = createServerFn({ method: 'POST' })
  .validator((v: { id: string; status: string; adminNotes?: string }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db
      .update(refund_requests)
      .set({ status: data.status, admin_notes: data.adminNotes ?? null, updated_at: new Date() })
      .where(eq(refund_requests.id, data.id))
    return { success: true }
  })
