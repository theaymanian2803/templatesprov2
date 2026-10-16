import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { refund_requests, orders } from '../db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { requireAdmin, requireUser, isAdmin } from '../admin'
import { logAudit } from '../audit'
import { refundPayPalOrder } from './paypal'
import { z } from 'zod'

const idSchema = z.string().min(1)

export const createRefundRequest = createServerFn({ method: 'POST' })
  .validator((v: unknown) => z.object({ orderId: z.string().min(1), reason: z.string().trim().min(1).max(2000) }).parse(v))
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

export const getRefundRequestByOrder = createServerFn({ method: 'GET' })
  .validator((v: unknown) => idSchema.parse(v))
  .handler(async ({ data: orderId }) => {
    const user = await requireUser()
    const rows = await db
      .select()
      .from(refund_requests)
      .where(and(eq(refund_requests.order_id, orderId), eq(refund_requests.user_id, user.id)))
      .limit(1)
    return rows[0] ?? null
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
  .validator((v: unknown) =>
    z
      .object({
        id: z.string().min(1),
        status: z.enum(['pending', 'approved', 'rejected']),
        adminNotes: z.string().max(2000).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()

    // When approving, actually refund the money via PayPal and mark the order
    // refunded before recording the decision. If the PayPal refund fails we
    // throw and leave the request unchanged so the admin can retry.
    if (data.status === 'approved') {
      const request = (await db.select().from(refund_requests).where(eq(refund_requests.id, data.id)).limit(1))[0]
      if (request) {
        const order = (await db.select().from(orders).where(eq(orders.id, request.order_id)).limit(1))[0]
        if (order) {
          if (order.paypal_order_id && Number(order.total_amount) > 0) {
            await refundPayPalOrder(order.paypal_order_id)
          }
          if (order.status !== 'refunded') {
            await db.update(orders).set({ status: 'refunded', updated_at: new Date() }).where(eq(orders.id, order.id))
          }
        }
      }
    }

    await db
      .update(refund_requests)
      .set({ status: data.status, admin_notes: data.adminNotes ?? null, updated_at: new Date() })
      .where(eq(refund_requests.id, data.id))
    await logAudit({ action: 'refund.status', entityType: 'refund', entityId: data.id, actor: admin, metadata: { status: data.status } })
    return { success: true }
  })

export const adminListRefundRequestsWithDetails = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const rows = await db.select().from(refund_requests).orderBy(desc(refund_requests.created_at))
  const orderIds = [...new Set(rows.map((r) => r.order_id))]
  const orderRows = orderIds.length
    ? await db
        .select({ id: orders.id, user_email: orders.user_email, total_amount: orders.total_amount })
        .from(orders)
        .where(inArray(orders.id, orderIds))
    : []
  const orderMap = new Map(orderRows.map((o) => [o.id, o]))
  return rows.map((r) => ({
    ...r,
    user_email: orderMap.get(r.order_id)?.user_email || 'Unknown',
    order_total: orderMap.get(r.order_id)?.total_amount || 0,
  }))
})

export const adminDeleteRefundRequest = createServerFn({ method: 'POST' })
  .validator((v: unknown) => idSchema.parse(v))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.delete(refund_requests).where(eq(refund_requests.id, id))
    await logAudit({ action: 'refund.delete', entityType: 'refund', entityId: id, actor: admin })
    return { success: true }
  })
