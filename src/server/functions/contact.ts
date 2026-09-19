import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client'
import { contacts } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAdmin } from '../admin'

export const submitContact = createServerFn({ method: 'POST' })
  .validator((v: { name: string; email: string; subject: string; message: string; templateId?: string; templateTitle?: string }) => v)
  .handler(async ({ data }) => {
    if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || !data.message.trim()) {
      throw new Error('All fields are required')
    }
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
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await db.update(contacts).set({ is_read: true }).where(eq(contacts.id, id))
    return { success: true }
  })

export const deleteContact = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    await db.delete(contacts).where(eq(contacts.id, id))
    return { success: true }
  })
