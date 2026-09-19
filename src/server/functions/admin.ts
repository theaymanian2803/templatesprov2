import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates, template_downloads, site_settings, orders, reviews, profiles } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin, isAdmin, requireUser } from '../admin'

export const getIsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return isAdmin(user.id)
})

export const adminListTemplates = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(templates).orderBy(desc(templates.created_at))
})

export const adminSaveTemplate = createServerFn({ method: 'POST' })
  .validator((t: any) => t)
  .handler(async ({ data }) => {
    await requireAdmin()
    if (data.id) {
      await db
        .update(templates)
        .set({
          title: data.title,
          description: data.description,
          category: data.category,
          price: data.price,
          extended_price: data.extended_price ?? null,
          image_url: data.image_url,
          gallery_images: data.gallery_images ?? [],
          tech_stack: data.tech_stack ?? [],
          features: data.features ?? [],
          demo_url: data.demo_url ?? null,
          youtube_id: data.youtube_id ?? null,
          updated_at: new Date(),
        })
        .where(eq(templates.id, data.id))
      if (data.source_file_url) {
        await db
          .insert(template_downloads)
          .values({ template_id: data.id, source_file_url: data.source_file_url })
          .onConflictDoUpdate({
            target: template_downloads.template_id,
            set: { source_file_url: data.source_file_url },
          })
      }
      return { success: true }
    }
    const [row] = await db
      .insert(templates)
      .values({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        extended_price: data.extended_price ?? null,
        image_url: data.image_url,
        gallery_images: data.gallery_images ?? [],
        tech_stack: data.tech_stack ?? [],
        features: data.features ?? [],
        demo_url: data.demo_url ?? null,
        youtube_id: data.youtube_id ?? null,
      })
      .returning()
    if (data.source_file_url) {
      await db.insert(template_downloads).values({ template_id: row.id, source_file_url: data.source_file_url })
    }
    return { success: true }
  })

export const adminDeleteTemplate = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await db.delete(templates).where(eq(templates.id, id))
    return { success: true }
  })

export const adminListOrders = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(orders).orderBy(desc(orders.created_at))
})

export const adminUpdateOrderStatus = createServerFn({ method: 'POST' })
  .validator((v: { orderId: string; status: string }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.update(orders).set({ status: data.status as any, updated_at: new Date() }).where(eq(orders.id, data.orderId))
    return { success: true }
  })

export const adminDeleteOrder = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await db.delete(orders).where(eq(orders.id, id))
    return { success: true }
  })

export const adminListReviews = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(reviews).orderBy(desc(reviews.created_at))
})

export const adminUpdateReviewStatus = createServerFn({ method: 'POST' })
  .validator((v: { id: string; status: string }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.update(reviews).set({ status: data.status as any, updated_at: new Date() }).where(eq(reviews.id, data.id))
    return { success: true }
  })

export const adminDeleteReview = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await db.delete(reviews).where(eq(reviews.id, id))
    return { success: true }
  })

export const getSiteSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select().from(site_settings)
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
})

export const saveSiteSetting = createServerFn({ method: 'POST' })
  .validator((v: { key: string; value: Record<string, unknown> }) => v)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db
      .insert(site_settings)
      .values({ key: data.key, value: data.value, updated_at: new Date() })
      .onConflictDoUpdate({ target: site_settings.key, set: { value: data.value, updated_at: new Date() } })
    return { success: true }
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .validator((v: { displayName?: string; avatarUrl?: string }) => v)
  .handler(async ({ data }) => {
    const user = await requireUser()
    await db
      .update(profiles)
      .set({ display_name: data.displayName ?? null, avatar_url: data.avatarUrl ?? null, updated_at: new Date() })
      .where(eq(profiles.user_id, user.id))
    return { success: true }
  })
