import { db } from '../db/client'
import { orders, order_items, templates, license_keys } from '../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { planKeyIssuance, mintKey } from './licenses-core'

/** Mints + stores any missing keys for a completed order. Best-effort; never throws. */
export async function issueKeysForOrder(orderId: string): Promise<void> {
  try {
    const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0]
    if (!order) return
    const items = await db.select().from(order_items).where(eq(order_items.order_id, orderId))
    if (!items.length) return

    const templateIds = [...new Set(items.map((i) => i.template_id))]
    const tpls = await db.select().from(templates).where(inArray(templates.id, templateIds))
    const productByTemplate = new Map(tpls.map((t) => [t.id, t.license_product ?? null]))

    const existing = await db
      .select()
      .from(license_keys)
      .where(and(eq(license_keys.user_id, order.user_id), inArray(license_keys.template_id, templateIds)))
    const existingIds = new Set(existing.map((k) => k.template_id))

    for (const plan of planKeyIssuance(items, productByTemplate, existingIds)) {
      const key = await mintKey(plan.product, `order:${orderId}`)
      if (!key) continue
      await db
        .insert(license_keys)
        .values({
          user_id: order.user_id,
          template_id: plan.template_id,
          product: plan.product,
          key,
          order_id: orderId,
        })
        .onConflictDoNothing()
    }
  } catch (e) {
    console.error('[licenses] issueKeysForOrder failed', e)
  }
}
