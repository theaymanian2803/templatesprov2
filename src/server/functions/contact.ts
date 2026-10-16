import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { contacts } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../admin'
import { logAudit } from '../audit'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(300),
  message: z.string().trim().min(1).max(5000),
  templateId: z.string().optional(),
  templateTitle: z.string().optional(),
})

export const submitContact = createServerFn({ method: 'POST' })
  .validator((v: unknown) => contactSchema.parse(v))
  .handler(async ({ data }) => {
    await db.insert(contacts).values({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      template_id: data.templateId ?? null,
      template_title: data.templateTitle ?? null,
    })
    return { success: true }
  })

export const listContacts = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  return db.select().from(contacts).orderBy(desc(contacts.created_at))
})

export const markContactRead = createServerFn({ method: 'POST' })
  .validator((v: unknown) => z.string().min(1).parse(v))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.update(contacts).set({ is_read: true }).where(eq(contacts.id, id))
    await logAudit({ action: 'contact.read', entityType: 'contact', entityId: id, actor: admin })
    return { success: true }
  })

export const deleteContact = createServerFn({ method: 'POST' })
  .validator((v: unknown) => z.string().min(1).parse(v))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin()
    await db.delete(contacts).where(eq(contacts.id, id))
    await logAudit({ action: 'contact.delete', entityType: 'contact', entityId: id, actor: admin })
    return { success: true }
  })
