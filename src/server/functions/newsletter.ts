import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { newsletter_subscribers } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../admin'
import { logAudit } from '../audit'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required').max(255),
})

export const subscribeToNewsletter = createServerFn({ method: 'POST' })
  .validator((v: unknown) => emailSchema.parse(v))
  .handler(async ({ data }) => {
    await db
      .insert(newsletter_subscribers)
      .values({ email: data.email })
      .onConflictDoNothing({ target: newsletter_subscribers.email })
    return { success: true }
  })

export const adminListNewsletterSubscribers = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(newsletter_subscribers).orderBy(desc(newsletter_subscribers.created_at))
})

export const adminDeleteNewsletterSubscriber = createServerFn({ method: 'POST' })
  .validator((id: unknown) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.delete(newsletter_subscribers).where(eq(newsletter_subscribers.id, id))
    await logAudit({ action: 'newsletter.delete', entityType: 'newsletter', entityId: id, actor: admin })
    return { success: true }
  })
