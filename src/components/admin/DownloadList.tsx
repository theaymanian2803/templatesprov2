import { useQuery } from '@tanstack/react-query'
import { adminGetDownloadStats } from '@/server/functions/downloads'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Inbox } from 'lucide-react'

const formatDate = (value: string | number | Date) => {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '—'
  }
}

export const DownloadList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-download-stats'],
    queryFn: () => adminGetDownloadStats(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const total = data?.total ?? 0
  const perTemplate = data?.perTemplate ?? []
  const recent = data?.recent ?? []

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total downloads tracked</div>
        </div>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Downloads per template</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Downloads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perTemplate.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{Number(t.download_count).toLocaleString()}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {perTemplate.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    No templates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent downloads</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{d.user_name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{d.user_email || '—'}</div>
                  </TableCell>
                  <TableCell>{d.template_title || '—'}</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatDate(d.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    <Inbox className="w-6 h-6 mx-auto mb-2 opacity-60" />
                    No downloads yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default DownloadList
