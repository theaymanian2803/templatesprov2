import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { getOrderItemsWithDownloads } from '@/server/functions/dashboard'
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
    queryFn: async () => getOrderItemsWithDownloads({ data: orderId }),
  })

  const handleDownload = async (sourceFileUrl: string, templateTitle: string) => {
    setDownloadingId(sourceFileUrl)
    try {
      const cleanUrl = sourceFileUrl.trim()
      const directUrl = getDirectDownloadUrl(cleanUrl)
      window.open(directUrl, '_blank', 'noopener,noreferrer')
      setDownloadingId(null)
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
