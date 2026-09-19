import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { notifications } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireUser } from '../admin'

export const listNotifications = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, user.id))
    .orderBy(desc(notifications.created_at))
    .limit(20)
})

export const markAsRead = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireUser()
    await db.update(notifications).set({ is_read: true }).where(eq(notifications.id, id))
    return { success: true }
  })

export const markAllAsRead = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  await db.update(notifications).set({ is_read: true }).where(eq(notifications.user_id, user.id))
  return { success: true }
})
