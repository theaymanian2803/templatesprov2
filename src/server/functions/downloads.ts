import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { downloads, templates, template_downloads, order_items, orders, all_access_passes, user } from '../db/schema'
import { eq, and, inArray, desc, count, sql } from 'drizzle-orm'
import { requireUser, requireAdmin } from '../admin'

export const recordDownload = createServerFn({ method: 'POST' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const currentUser = await requireUser()

    const pass = (await db.select().from(all_access_passes).where(eq(all_access_passes.user_id, currentUser.id)).limit(1))[0]
    let hasAccess = !!pass
    if (!hasAccess) {
      const items = await db.select({ order_id: order_items.order_id }).from(order_items).where(eq(order_items.template_id, templateId))
      const orderIds = items.map((i) => i.order_id)
      if (orderIds.length) {
        const completed = await db
          .select({ id: orders.id })
          .from(orders)
          .where(and(inArray(orders.id, orderIds), eq(orders.user_id, currentUser.id), eq(orders.status, 'completed')))
          .limit(1)
        hasAccess = completed.length > 0
      }
    }
    if (!hasAccess) throw new Error('You do not have access to this template')

    const file = (await db.select().from(template_downloads).where(eq(template_downloads.template_id, templateId)).limit(1))[0]

    await db.insert(downloads).values({ user_id: currentUser.id, template_id: templateId })
    await db.update(templates).set({ download_count: sql`${templates.download_count} + 1` }).where(eq(templates.id, templateId))

    return { source_file_url: file?.source_file_url ?? null }
  })

export const adminGetDownloadStats = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()

  const [{ value: total }] = await db.select({ value: count() }).from(downloads)

  const perTemplate = await db
    .select({ id: templates.id, title: templates.title, download_count: templates.download_count })
    .from(templates)
    .orderBy(desc(templates.download_count))

  const recent = await db
    .select({
      id: downloads.id,
      created_at: downloads.created_at,
      user_email: user.email,
      user_name: user.name,
      template_id: downloads.template_id,
      template_title: templates.title,
    })
    .from(downloads)
    .leftJoin(user, eq(user.id, downloads.user_id))
    .leftJoin(templates, eq(templates.id, downloads.template_id))
    .orderBy(desc(downloads.created_at))
    .limit(200)

  return { total: total ?? 0, perTemplate, recent }
})
