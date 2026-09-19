import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates } from '../db/schema'
import { eq, desc, count, like } from 'drizzle-orm'

type ListOptions = { featured?: boolean; category?: string; limit?: number }

export const listTemplates = createServerFn({ method: 'GET' })
  .validator((o: ListOptions) => o)
  .handler(async ({ data }) => {
    let q = db.select().from(templates)
    if (data.featured) q = q.where(eq(templates.featured, true))
    if (data.category) q = q.where(eq(templates.category, data.category))
    return q.orderBy(desc(templates.sales)).limit(data.limit ?? 100)
  })

export const listTemplatesPaginated = createServerFn({ method: 'GET' })
  .validator((o: ListOptions & { page: number; pageSize: number }) => o)
  .handler(async ({ data }) => {
    const page = data.page || 1
    const pageSize = data.pageSize || 9
    const where = data.featured
      ? eq(templates.featured, true)
      : data.category
        ? eq(templates.category, data.category)
        : undefined
    const [{ value: total }] = await db.select({ value: count() }).from(templates).where(where)
    const rows = await db
      .select()
      .from(templates)
      .where(where)
      .orderBy(desc(templates.sales))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
    return { data: rows, count: total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  })

export const getTemplate = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const rows = await db.select().from(templates).where(eq(templates.id, data)).limit(1)
    return rows[0] ?? null
  })

export const getCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select({ category: templates.category }).from(templates)
  return [...new Set(rows.map((r) => r.category))]
})

export const searchTemplates = createServerFn({ method: 'GET' })
  .validator((query: string) => query)
  .handler(async ({ data }) => {
    return db.select().from(templates).where(like(templates.title, `%${data}%`)).limit(5)
  })

export const getCatalogPriceRange = createServerFn({ method: 'GET' }).handler(async () => {
  const minRow = (await db.select({ price: templates.price }).from(templates).orderBy(templates.price).limit(1))[0]
  const maxRow = (await db.select({ price: templates.price }).from(templates).orderBy(desc(templates.price)).limit(1))[0]
  return { min: minRow?.price, max: maxRow?.price }
})
