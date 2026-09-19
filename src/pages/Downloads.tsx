import Footer from '@/components/Footer'
import HostingWizard from '@/components/HostingWizard'
import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useAllAccessPass } from '@/hooks/useAllAccessPass'
import { usePurchasedTemplates } from '@/hooks/useDashboard'
import { supabase } from '@/integrations/supabase/client'
import { getDirectDownloadUrl } from '@/lib/utils'
import { Crown, Download, FileArchive, Loader2, Package, Rocket, Search, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

const Downloads = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: purchased, isLoading } = usePurchasedTemplates()
  const { data: allAccessPass } = useAllAccessPass()
  const { toast } = useToast()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [hostingOpen, setHostingOpen] = useState(false)
  const [hostingTitle, setHostingTitle] = useState('')

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth')
  }, [user, authLoading, navigate])

  const handleDownload = async (sourceFileUrl: string, title: string) => {
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
      link.download = `${title}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: unknown) {
      toast({
        title: 'Échec du téléchargement',
        description: error instanceof Error ? error.message : 'Impossible de générer le lien de téléchargement',
        variant: 'destructive',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRemove = async (itemId: string, title: string) => {
    if (!confirm(`Supprimer "${title}" de vos téléchargements ? Cette action est irréversible.`)) return
    setDeletingId(itemId)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const response = await supabase.functions.invoke('remove-purchased-template', {
        body: { itemId },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      if (response.error) throw new Error(response.error.error || response.data?.error || 'Échec de la suppression')
      if (response.data?.error) throw new Error(response.data.error)

      queryClient.invalidateQueries({ queryKey: ['purchased-templates'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast({ title: 'Template supprimé', description: `"${title}" a été retiré de vos téléchargements.` })
    } catch (error: unknown) {
      toast({ title: 'Erreur', description: error instanceof Error ? error.message : 'Échec de la suppression', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = (purchased || []).filter((t) =>
    t.template_title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Mes téléchargements
            </h1>
            <p className="text-muted-foreground mt-1">
              Accédez à tous vos templates achetés à tout moment
            </p>
          </div>

          {/* All-Access Pass banner */}
          {allAccessPass && (
            <div className="mb-6 rounded-xl bg-[#e85a2d] text-white p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold font-slab">Pass Tout Accès actif</p>
                <p className="text-sm text-white/85">
                  Tous les templates du catalogue sont inclus — y compris les futurs ajouts.
                </p>
              </div>
              <Link to="/templates">
                <Button size="sm" className="bg-white text-[#e85a2d] hover:bg-[#FFF4EF] font-semibold shrink-0">
                  Parcourir le catalogue
                </Button>
              </Link>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans mes achats..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {search ? 'Aucun template trouvé' : 'Aucun achat pour le moment'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? 'Essayez un autre terme de recherche'
                    : 'Parcourez notre catalogue pour trouver le template parfait'}
                </p>
                {!search && (
                  <Link to="/templates">
                    <Button>Parcourir</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <Card key={`${item.order_id}-${item.template_id}`} className="border-border/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileArchive className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/template/${item.template_id}`}
                          className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block">
                          {item.template_title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className={`text-[10px] capitalize ${item.license_type === 'pass' ? 'border-[#e85a2d]/40 bg-[#e85a2d]/5 text-[#e85a2d]' : ''}`}>
                            {item.license_type === 'pass' ? 'Pass Tout Accès' : item.license_type}
                          </Badge>
                          <span>·</span>
                          {item.license_type === 'pass' ? (
                            <span className="text-[#e85a2d] font-semibold">Inclus</span>
                          ) : (
                            <>
                              <span>{new Date(item.purchased_at).toLocaleDateString()}</span>
                              <span>·</span>
                              <span>${Number(item.price).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!item.has_review && (
                        <Link to={`/template/${item.template_id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-accent">
                            <Star className="w-3 h-3" /> Avis
                          </Button>
                        </Link>
                      )}
                      {item.source_file_url ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDownload(item.source_file_url!, item.template_title)
                            }
                            disabled={downloadingId === item.source_file_url}
                            className="gap-1">
                            {downloadingId === item.source_file_url ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            Télécharger
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setHostingTitle(item.template_title)
                              setHostingOpen(true)
                            }}>
                            <Rocket className="w-3 h-3" /> Héberger
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Fichier non disponible</span>
                      )}
                      {item.license_type !== 'pass' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(item.id, item.template_title)}
                          disabled={deletingId === item.id}>
                          {deletingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <HostingWizard
        open={hostingOpen}
        onOpenChange={setHostingOpen}
        templateTitle={hostingTitle}
      />
    </main>
  )
}

export default Downloads
