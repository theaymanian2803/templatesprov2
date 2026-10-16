import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { notifications } from '../db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { requireUser } from '../admin'
import { z } from 'zod'

export const listMyNotifications = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, user.id))
    .orderBy(desc(notifications.created_at))
    .limit(50)
  return rows as any
})

export const getMyUnreadNotificationCount = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.user_id, user.id), eq(notifications.is_read, false)))
  return row?.value ?? 0
})

export const markNotificationRead = createServerFn({ method: 'POST' })
  .validator((v: unknown) => z.object({ id: z.string().min(1) }).parse(v))
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db
      .update(notifications)
      .set({ is_read: true })
      .where(and(eq(notifications.id, data.id), eq(notifications.user_id, user.id)))
    return { success: true }
  })

export const markAllNotificationsRead = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  await db.update(notifications).set({ is_read: true }).where(eq(notifications.user_id, user.id))
  return { success: true }
})
