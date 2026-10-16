import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates, template_downloads, site_settings, orders, reviews, profiles, user, user_roles, audit_log } from '../db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { requireAdmin, isAdmin, requireUser } from '../admin'
import { logAudit } from '../audit'
import { z } from 'zod'

const templateInputSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().nullable().optional(),
  admin_description: z.string().nullable().optional(),
  category: z.string().trim().min(1, 'Category is required').max(50),
  price: z.number().min(0, 'Price must be positive'),
  extended_price: z.number().min(0).nullable().optional(),
  image_url: z.string().url('Image must be a valid URL'),
  gallery_images: z.array(z.string()).optional().default([]),
  tech_stack: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  demo_url: z.string().url().nullable().or(z.literal('')).optional(),
  youtube_id: z.string().nullable().optional(),
  license_product: z.string().nullable().optional(),
  source_file_url: z.string().url().or(z.literal('')).optional(),
  featured: z.boolean().optional(),
})

const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']),
})

const reviewStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']),
})

const bulkReviewStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.enum(['pending', 'approved', 'rejected']),
})

const idSchema = z.string().min(1, 'A valid id is required')
const idsSchema = z.array(z.string().min(1)).min(1)
const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['admin', 'moderator', 'user']),
})

export const getIsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  return isAdmin(user.id)
})

export const adminListTemplates = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(templates).orderBy(desc(templates.created_at))
})

export const adminSaveTemplate = createServerFn({ method: 'POST' })
  .validator((data: unknown) => templateInputSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    const shared = {
      title: data.title,
      description: data.description ?? null,
      admin_description: data.admin_description ?? null,
      category: data.category,
      price: data.price,
      extended_price: data.extended_price ?? null,
      image_url: data.image_url,
      gallery_images: data.gallery_images ?? [],
      tech_stack: data.tech_stack ?? [],
      features: data.features ?? [],
      demo_url: data.demo_url || null,
      youtube_id: data.youtube_id?.trim() || null,
      license_product: data.license_product?.trim() || null,
    }
    if (data.id) {
      await db
        .update(templates)
        .set({
          ...shared,
          ...(data.featured !== undefined ? { featured: data.featured } : {}),
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
      await logAudit({ action: 'template.update', entityType: 'template', entityId: data.id, actor: admin, metadata: { title: data.title } })
      return { success: true }
    }
    const [row] = await db
      .insert(templates)
      .values({ ...shared, featured: data.featured ?? false })
      .returning()
    if (data.source_file_url) {
      await db.insert(template_downloads).values({ template_id: row.id, source_file_url: data.source_file_url })
    }
    await logAudit({ action: 'template.create', entityType: 'template', entityId: row.id, actor: admin, metadata: { title: data.title } })
    return { success: true }
  })

export const adminDeleteTemplate = createServerFn({ method: 'POST' })
  .validator((id: unknown) => idSchema.parse(id))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.delete(templates).where(eq(templates.id, id))
    await logAudit({ action: 'template.delete', entityType: 'template', entityId: id, actor: admin })
    return { success: true }
  })

export const adminListOrders = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(orders).orderBy(desc(orders.created_at))
})

export const adminUpdateOrderStatus = createServerFn({ method: 'POST' })
  .validator((v: unknown) => orderStatusSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    await db.update(orders).set({ status: data.status, updated_at: new Date() }).where(eq(orders.id, data.orderId))
    await logAudit({ action: 'order.status', entityType: 'order', entityId: data.orderId, actor: admin, metadata: { status: data.status } })
    return { success: true }
  })

export const adminDeleteOrder = createServerFn({ method: 'POST' })
  .validator((id: unknown) => idSchema.parse(id))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.delete(orders).where(eq(orders.id, id))
    await logAudit({ action: 'order.delete', entityType: 'order', entityId: id, actor: admin })
    return { success: true }
  })

export const adminListReviews = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(reviews).orderBy(desc(reviews.created_at))
})

export const adminUpdateReviewStatus = createServerFn({ method: 'POST' })
  .validator((v: unknown) => reviewStatusSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    await db.update(reviews).set({ status: data.status, updated_at: new Date() }).where(eq(reviews.id, data.id))
    await logAudit({ action: 'review.status', entityType: 'review', entityId: data.id, actor: admin, metadata: { status: data.status } })
    return { success: true }
  })

export const adminDeleteReview = createServerFn({ method: 'POST' })
  .validator((id: unknown) => idSchema.parse(id))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.delete(reviews).where(eq(reviews.id, id))
    await logAudit({ action: 'review.delete', entityType: 'review', entityId: id, actor: admin })
    return { success: true }
  })

export const adminListReviewsWithDetails = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const rows = await db.select().from(reviews).orderBy(desc(reviews.created_at))
  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const templateIds = [...new Set(rows.map((r) => r.template_id))]
  const profileRows = userIds.length ? await db.select().from(profiles).where(inArray(profiles.user_id, userIds)) : []
  const templateRows = templateIds.length ? await db.select().from(templates).where(inArray(templates.id, templateIds)) : []
  const profileMap = new Map(profileRows.map((p) => [p.user_id, p.display_name]))
  const templateMap = new Map(templateRows.map((t) => [t.id, t.title]))
  return rows.map((r) => ({
    ...r,
    display_name: profileMap.get(r.user_id) || 'Anonymous',
    template_title: templateMap.get(r.template_id) || 'Unknown Template',
  }))
})

export const adminUpdateReviewsStatus = createServerFn({ method: 'POST' })
  .validator((v: unknown) => bulkReviewStatusSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    await db.update(reviews).set({ status: data.status, updated_at: new Date() }).where(inArray(reviews.id, data.ids))
    await logAudit({ action: 'review.bulkStatus', entityType: 'review', entityId: null, actor: admin, metadata: { ids: data.ids, status: data.status } })
    return { success: true }
  })

export const adminDeleteReviews = createServerFn({ method: 'POST' })
  .validator((ids: unknown) => idsSchema.parse(ids))
  .handler(async ({ data: ids }) => {
    const admin = await requireAdmin()
    await db.delete(reviews).where(inArray(reviews.id, ids))
    await logAudit({ action: 'review.bulkDelete', entityType: 'review', entityId: null, actor: admin, metadata: { ids } })
    return { success: true }
  })

export const getSiteSettings = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const rows = await db.select().from(site_settings)
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as any
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

export const getMyProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db.select().from(profiles).where(eq(profiles.user_id, user.id)).limit(1)
  return rows[0] ?? null
})

export const adminGetTemplateDownloadUrl = createServerFn({ method: 'GET' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    await requireAdmin()
    const row = (await db.select().from(template_downloads).where(eq(template_downloads.template_id, templateId)).limit(1))[0]
    return row ? row.source_file_url : null
  })

const roleRank: Record<string, number> = { admin: 3, moderator: 2, user: 1 }

export const adminListUsers = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const users = await db.select().from(user).orderBy(desc(user.createdAt))
  const roles = await db.select().from(user_roles)
  const roleMap = new Map<string, string>()
  for (const r of roles) {
    const current = roleMap.get(r.user_id)
    if (!current || (roleRank[r.role] ?? 0) > (roleRank[current] ?? 0)) roleMap.set(r.user_id, r.role)
  }
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    created_at: u.createdAt,
    role: roleMap.get(u.id) ?? 'user',
  }))
})

export const adminSetUserRole = createServerFn({ method: 'POST' })
  .validator((v: unknown) => roleSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    if (data.userId === admin.id) throw new Error('You cannot change your own role')

    const existing = await db.select().from(user_roles).where(eq(user_roles.user_id, data.userId))
    const wasAdmin = existing.some((r) => r.role === 'admin')
    if (wasAdmin && data.role !== 'admin') {
      const admins = await db.select().from(user_roles).where(eq(user_roles.role, 'admin'))
      if (admins.length <= 1) throw new Error('Cannot remove the last remaining admin')
    }

    await db.delete(user_roles).where(eq(user_roles.user_id, data.userId))
    await db.insert(user_roles).values({ user_id: data.userId, role: data.role })
    await logAudit({ action: 'user.role', entityType: 'user', entityId: data.userId, actor: admin, metadata: { role: data.role } })
    return { success: true }
  })

export const adminListAuditLog = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const rows = await db.select().from(audit_log).orderBy(desc(audit_log.created_at)).limit(200)
  return rows as any
})
