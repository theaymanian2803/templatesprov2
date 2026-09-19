import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { getDirectDownloadUrl } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Download, FileArchive, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface OrderItemsListProps {
  orderId: string
  orderStatus: string
}

const OrderItemsList = ({ orderId, orderStatus }: OrderItemsListProps) => {
  const { toast } = useToast()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ['order-items-with-files', orderId],
    queryFn: async () => {
      // Fetch order items
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (error) throw error

      // Fetch download URLs from secure template_downloads table (RLS-gated)
      const templateIds = orderItems.map((item) => item.template_id)
      const { data: downloads, error: dlError } = await supabase
        .from('template_downloads' as any)
        .select('template_id, source_file_url')
        .in('template_id', templateIds)

      const fileMap = new Map(
        ((downloads as any[]) ?? []).map((d: any) => [d.template_id, d.source_file_url])
      )

      return orderItems.map((item) => ({
        ...item,
        source_file_url: fileMap.get(item.template_id) ?? null,
      }))
    },
  })

  const handleDownload = async (sourceFileUrl: string, templateTitle: string) => {
    setDownloadingId(sourceFileUrl)
    try {
      const cleanUrl = sourceFileUrl.trim()

      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        const directUrl = getDirectDownloadUrl(cleanUrl)
        window.open(directUrl, '_blank', 'noopener,noreferrer')
        setDownloadingId(null)
        return
      }

      const { data, error } = await supabase.storage
        .from('template-files')
        .createSignedUrl(cleanUrl, 60)

      if (error) throw error

      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = `${templateTitle}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      toast({
        title: 'Échec du téléchargement',
        description: error.message || 'Impossible de générer le lien de téléchargement',
        variant: 'destructive',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const canDownload = orderStatus === 'completed'

  if (isLoading) {
    return (
      <div className="p-3 border-t space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!items?.length) {
    return (
      <div className="p-3 border-t text-sm text-muted-foreground">
        Aucun article trouvé pour cette commande.
      </div>
    )
  }

  return (
    <div className="p-3 border-t space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-2 rounded-md bg-background">
          <div className="flex items-center gap-2 min-w-0">
            <FileArchive className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.template_title}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {item.license_type} · ${Number(item.price).toFixed(2)}
              </p>
            </div>
          </div>
          {canDownload && item.source_file_url ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(item.source_file_url!, item.template_title)}
              disabled={downloadingId === item.source_file_url}>
              {downloadingId === item.source_file_url ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              <span className="ml-1">Télécharger</span>
            </Button>
          ) : !canDownload ? (
            <span className="text-xs text-muted-foreground">Disponible après finalisation</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default OrderItemsList
