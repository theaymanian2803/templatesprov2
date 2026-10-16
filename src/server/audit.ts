import { db } from './db/client'
import { audit_log } from './db/schema'
import { getSession } from './auth'

interface AuditActor {
  id: string
  email: string
}

interface LogAuditInput {
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown>
  actor?: AuditActor
}

/**
 * Record an admin/moderation action for the audit trail. Best-effort: a failure
 * to write the log must never block the primary mutation.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    let actorId = input.actor?.id
    let actorEmail = input.actor?.email ?? null
    if (!actorId) {
      const session = await getSession()
      actorId = session?.session?.userId ?? 'system'
      actorEmail = session?.user?.email ?? null
    }
    await db.insert(audit_log).values({
      actor_user_id: actorId,
      actor_email: actorEmail,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    })
  } catch (error) {
    console.error('logAudit failed', error)
  }
}
