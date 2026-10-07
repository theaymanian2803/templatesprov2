import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useMyLicenses, useMyPendingLicenses } from '@/hooks/useLicenses'
import { claimMyLicenses } from '@/server/functions/licenses'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { KeyRound, Copy, Loader2, RefreshCw } from 'lucide-react'

const BuyerLicenses = () => {
  const { user } = useAuth()
  const { data: licenses, isLoading } = useMyLicenses()
  const { data: pending } = useMyPendingLicenses()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [claiming, setClaiming] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    setClaiming(true)
    claimMyLicenses()
      .then(() => active && queryClient.invalidateQueries({ queryKey: ['licenses'] }))
      .catch(() => {})
      .finally(() => active && setClaiming(false))
    return () => {
      active = false
    }
  }, [queryClient, user])

  const refresh = async () => {
    setRefreshing(true)
    try {
      await claimMyLicenses()
    } catch {
      // best-effort; leave the pending card visible so the buyer can retry
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['licenses'] }),
      queryClient.invalidateQueries({ queryKey: ['licenses-pending'] }),
    ])
    setRefreshing(false)
  }

  if (isLoading || (claiming && !licenses?.length)) {
    return (
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your licenses…
      </div>
    )
  }

  const hasPending = !!pending?.length
  if (!licenses?.length && !hasPending) return null

  const copy = async (key: string) => {
    await navigator.clipboard.writeText(key)
    toast({ title: 'License key copied', description: 'Paste it into your site’s /admin → Activate.' })
  }

  return (
    <div className="mb-8">
      {licenses?.length ? (
        <>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Your license keys
          </h2>
          <div className="space-y-3">
            {licenses.map((lic) => (
              <Card key={lic.id} className="border-border/50">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{lic.template_title}</p>
                    <code className="text-xs font-mono text-muted-foreground break-all">{lic.key}</code>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => copy(lic.key)}>
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Paste your key into your deployed template’s <code>/admin</code> → <strong>Activate</strong> screen.
          </p>
        </>
      ) : null}

      {hasPending ? (
        <Card className="border-border/50 mt-3">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Generating your key…
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {pending!.map((p) => (
                  <li key={p.template_id} className="truncate">
                    {p.template_title}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 shrink-0"
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export default BuyerLicenses
