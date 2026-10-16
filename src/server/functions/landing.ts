import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { landing_sections } from '../db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '../admin'
import { logAudit } from '../audit'
import { LANDING_SECTIONS } from '../../lib/landingSections'
import { z } from 'zod'

/**
 * Returns every landing section, inserting any registered sections that are
 * missing so the admin always has a complete, ordered list to manage. Safe to
 * call publicly (it only ever adds the fixed set of registered sections).
 */
export const listLandingSections = createServerFn({ method: 'GET' }).handler(async () => {
  const existing = await db
    .select({ section_key: landing_sections.section_key })
    .from(landing_sections)
  const have = new Set(existing.map((e) => e.section_key))
  const missing = LANDING_SECTIONS.filter((s) => !have.has(s.key))
  if (missing.length) {
    await db
      .insert(landing_sections)
      .values(
        missing.map((s) => ({
          section_key: s.key,
          title: s.label,
          visible: true,
          sort_order: LANDING_SECTIONS.findIndex((d) => d.key === s.key),
        })),
      )
      .onConflictDoNothing({ target: landing_sections.section_key })
  }

  const rows = await db
    .select()
    .from(landing_sections)
    .orderBy(asc(landing_sections.sort_order))
  return rows as any
})

const updateSectionSchema = z.object({
  id: z.string().min(1),
  updates: z.object({
    visible: z.boolean().optional(),
    title: z.string().max(120).optional(),
    subtitle: z.string().max(300).optional(),
    image_url: z.string().max(2000).optional(),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
})

export const adminUpdateLandingSection = createServerFn({ method: 'POST' })
  .validator((v: unknown) => updateSectionSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    await db
      .update(landing_sections)
      .set({ ...data.updates, updated_at: new Date() })
      .where(eq(landing_sections.id, data.id))
    await logAudit({
      action: 'landing.update',
      entityType: 'landing_section',
      entityId: data.id,
      actor: admin,
      metadata: { fields: Object.keys(data.updates) },
    })
    return { success: true }
  })

const addSectionSchema = z.object({
  type: z.string().min(1).max(60),
  title: z.string().trim().min(1, 'A title is required').max(120),
  subtitle: z.string().max(300).optional(),
  image_url: z.string().max(2000).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

export const adminAddLandingSection = createServerFn({ method: 'POST' })
  .validator((v: unknown) => addSectionSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    const rows = await db.select({ sort_order: landing_sections.sort_order }).from(landing_sections)
    const nextOrder = rows.reduce((max, r) => Math.max(max, r.sort_order), -1) + 1
    const [row] = await db
      .insert(landing_sections)
      .values({
        section_key: `${data.type}_${Date.now()}`,
        title: data.title,
        subtitle: data.subtitle ?? '',
        image_url: data.image_url ?? '',
        visible: true,
        sort_order: nextOrder,
        config: { ...(data.config ?? {}), type: data.type },
      })
      .returning()
    await logAudit({
      action: 'landing.add',
      entityType: 'landing_section',
      entityId: row.id,
      actor: admin,
      metadata: { type: data.type },
    })
    return { success: true, id: row.id }
  })

export const adminDeleteLandingSection = createServerFn({ method: 'POST' })
  .validator((v: unknown) => z.object({ id: z.string().min(1) }).parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    const [row] = await db
      .select({ section_key: landing_sections.section_key })
      .from(landing_sections)
      .where(eq(landing_sections.id, data.id))
      .limit(1)
    if (!row) throw new Error('Section not found')
    // Built-in sections are re-seeded on read, so deleting them would just
    // resurrect them. Only custom sections can be deleted.
    if (LANDING_SECTIONS.some((s) => s.key === row.section_key)) {
      throw new Error('Built-in sections cannot be deleted — hide them instead')
    }
    await db.delete(landing_sections).where(eq(landing_sections.id, data.id))
    await logAudit({
      action: 'landing.delete',
      entityType: 'landing_section',
      entityId: data.id,
      actor: admin,
      metadata: { sectionKey: row.section_key },
    })
    return { success: true }
  })

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) })

export const adminReorderLandingSections = createServerFn({ method: 'POST' })
  .validator((v: unknown) => reorderSchema.parse(v))
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    await Promise.all(
      data.ids.map((id, index) =>
        db
          .update(landing_sections)
          .set({ sort_order: index, updated_at: new Date() })
          .where(eq(landing_sections.id, id)),
      ),
    )
    await logAudit({
      action: 'landing.reorder',
      entityType: 'landing_section',
      entityId: null,
      actor: admin,
      metadata: { ids: data.ids },
    })
    return { success: true }
  })
