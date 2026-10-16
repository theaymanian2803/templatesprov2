import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSiteSettings, saveSiteSetting } from '@/server/functions/admin'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Server } from 'lucide-react'

interface HostingPlatformsSetting {
  pro_service?: { enabled?: boolean; price?: number }
  [key: string]: unknown
}

export const SettingsPanel = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => getSiteSettings() as Promise<Record<string, unknown>>,
  })

  const hosting = (settings?.hosting_platforms as HostingPlatformsSetting) ?? {}
  const [proEnabled, setProEnabled] = useState(true)
  const [proPrice, setProPrice] = useState('0')

  useEffect(() => {
    const ps = hosting.pro_service
    if (ps) {
      setProEnabled(ps.enabled ?? true)
      setProPrice(String(ps.price ?? 0))
    }
  }, [settings])

  const save = useMutation({
    mutationFn: async () => {
      await saveSiteSetting({
        data: {
          key: 'hosting_platforms',
          value: {
            ...hosting,
            pro_service: { enabled: proEnabled, price: Number(proPrice) || 0 },
          },
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
      toast({ title: 'Settings saved' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Pro Hosting service
          </CardTitle>
          <CardDescription>
            Controls the &ldquo;Hire a Pro&rdquo; service shown on the hosting wizard and used at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Pro Hosting</Label>
              <p className="text-xs text-muted-foreground">Offer a managed deployment service to buyers.</p>
            </div>
            <Switch checked={proEnabled} onCheckedChange={setProEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pro-price">Service price ($)</Label>
            <Input
              id="pro-price"
              type="number"
              min="0"
              value={proPrice}
              onChange={(e) => setProPrice(e.target.value)}
              className="max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Amount charged via PayPal for the Pro Hosting service. Set to 0 for a free service.
            </p>
          </div>

          <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPanel
