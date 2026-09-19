import { db } from './db/client'
import { user_roles } from './db/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from './auth'

export async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(user_roles)
    .where(and(eq(user_roles.user_id, userId), eq(user_roles.role, 'admin')))
    .limit(1)
  return rows.length > 0
}

export async function requireUser(): Promise<{ id: string; email: string }> {
  const data = await getSession()
  if (!data?.session || !data.user) throw new Error('Not authenticated')
  return { id: data.session.userId, email: data.user.email }
}

export async function requireAdmin() {
  const user = await requireUser()
  if (!(await isAdmin(user.id))) throw new Error('Not authorized')
  return user
}
