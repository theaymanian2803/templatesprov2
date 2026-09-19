import { db } from './db/client'
import { user_roles } from './db/schema'
import { eq, and } from 'drizzle-orm'

export async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(user_roles)
    .where(and(eq(user_roles.user_id, userId), eq(user_roles.role, 'admin')))
    .limit(1)
  return rows.length > 0
}
