import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { favorites } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireUser } from '../admin'

export const listFavorites = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const rows = await db.select({ template_id: favorites.template_id }).from(favorites).where(eq(favorites.user_id, user.id))
  return rows.map((r) => r.template_id)
})

export const toggleFavorite = createServerFn({ method: 'POST' })
  .validator((templateId: string) => templateId)
  .handler(async ({ data: templateId }) => {
    const user = await requireUser()
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.user_id, user.id), eq(favorites.template_id, templateId)))
      .limit(1)
    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.user_id, user.id), eq(favorites.template_id, templateId)))
      return { isFavorite: false }
    }
    await db.insert(favorites).values({ user_id: user.id, template_id: templateId })
    return { isFavorite: true }
  })
