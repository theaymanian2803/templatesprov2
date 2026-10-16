import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { templates } from '../db/schema'
import { eq, desc, count, like, and } from 'drizzle-orm'
import { getDisplayRating, getDisplaySales } from '../../lib/seeded'

type ListOptions = { featured?: boolean; category?: string; limit?: number }

export const listTemplates = createServerFn({ method: 'GET' })
  .validator((o: ListOptions) => o)
  .handler(async ({ data }) => {
    const conditions = []
    if (data.featured) conditions.push(eq(templates.featured, true))
    if (data.category) conditions.push(eq(templates.category, data.category))
    return db
      .select()
      .from(templates)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(templates.sales))
      .limit(data.limit ?? 100)
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

type CatalogSort = 'best_match' | 'best_sellers' | 'newest' | 'best_rated' | 'trending' | 'price'
type CatalogInput = {
  category?: string | null
  query?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  rating?: number | null
  sales?: string[]
  sort?: CatalogSort
  page?: number
  pageSize?: number
}

export const searchCatalog = createServerFn({ method: 'GET' })
  .validator((o: CatalogInput) => o)
  .handler(async ({ data }) => {
    const page = data.page && data.page > 0 ? data.page : 1
    const pageSize = data.pageSize && data.pageSize > 0 ? data.pageSize : 10
    const all = await db.select().from(templates)

    const categoryCounts: Record<string, number> = { __all: all.length }
    for (const t of all) {
      const c = t.category || 'Uncategorized'
      categoryCounts[c] = (categoryCounts[c] ?? 0) + 1
    }

    let list = all
    if (data.category) list = list.filter((t) => t.category === data.category)
    if (data.query?.trim()) {
      const q = data.query.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q) ||
          (t.tech_stack ?? []).some((s) => s.toLowerCase().includes(q)),
      )
    }
    if (data.minPrice != null) list = list.filter((t) => Number(t.price) >= data.minPrice!)
    if (data.maxPrice != null) list = list.filter((t) => Number(t.price) <= data.maxPrice!)
    if (data.onSale) list = list.filter((t) => t.extended_price != null && Number(t.extended_price) > Number(t.price))
    if (data.rating != null) list = list.filter((t) => getDisplayRating(t.id, t.rating) >= data.rating!)
    if (data.sales?.length) {
      list = list.filter((t) => {
        const s = getDisplaySales(t.id, t.sales)
        return data.sales!.some((bucket) => {
          if (bucket === 'none') return s === 0
          if (bucket === 'low') return s > 0 && s < 50
          if (bucket === 'medium') return s >= 50 && s < 250
          if (bucket === 'high') return s >= 250 && s < 1000
          if (bucket === 'top') return s >= 1000
          return false
        })
      })
    }

    const sorted = [...list]
    const salesOf = (t: (typeof all)[number]) => getDisplaySales(t.id, t.sales)
    const ratingOf = (t: (typeof all)[number]) => getDisplayRating(t.id, t.rating)
    switch (data.sort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'best_rated':
        sorted.sort((a, b) => ratingOf(b) - ratingOf(a))
        break
      case 'price':
        sorted.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'trending':
        sorted.sort((a, b) => salesOf(b) * ratingOf(b) - salesOf(a) * ratingOf(a))
        break
      case 'best_sellers':
      case 'best_match':
      default:
        sorted.sort((a, b) => salesOf(b) - salesOf(a))
        break
    }

    const total = sorted.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const currentPage = Math.min(page, totalPages)
    const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return { data: paged, total, page: currentPage, pageSize, totalPages, categoryCounts } as any
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
