import { useQuery } from '@tanstack/react-query'
import { adminListAuditLog } from '@/server/functions/admin'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, History } from 'lucide-react'
import { format } from 'date-fns'

interface AuditEntry {
  id: string
  actor_email: string | null
  actor_user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: Date | string
}

export const AuditLogList = () => {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: async () => adminListAuditLog() as unknown as AuditEntry[],
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No audit entries yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        The 200 most recent admin actions, newest first. Read-only.
      </p>
      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="text-sm">{entry.actor_email || entry.actor_user_id}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">{entry.action}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.entity_type}
                  {entry.entity_id ? ` · ${entry.entity_id.slice(0, 8)}` : ''}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                  {Object.keys(entry.metadata ?? {}).length ? JSON.stringify(entry.metadata) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AuditLogList
