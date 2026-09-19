import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import FullScreenPreview from '@/components/preview/FullScreenPreview'
import RelatedTemplates from '@/components/preview/RelatedTemplates'
import ReviewSection from '@/components/preview/ReviewSection'
import TemplateFeatures from '@/components/preview/TemplateFeatures'
import TemplateGallery from '@/components/preview/TemplateGallery'
import TemplateSidebar from '@/components/preview/TemplateSidebar'
import TemplateTechStack from '@/components/preview/TemplateTechStack'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import { useAllAccessPass } from '@/hooks/useAllAccessPass'
import { useTemplate } from '@/hooks/useTemplates'
import { supabase } from '@/integrations/supabase/client'
import { getDirectDownloadUrl } from '@/lib/utils'
import { ArrowLeft, BadgeCheck, Download, Home, Loader2, Maximize2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

const TemplatePreview = () => {
  const { id } = useParams<{ id: string }>()
  const { data: template, isLoading, error } = useTemplate(id || '')
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { data: allAccessPass } = useAllAccessPass()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const { data: downloadInfo } = useQuery({
    queryKey: ['template-download-url', id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_downloads')
        .select('source_file_url')
        .eq('template_id', id)
        .maybeSingle()
      if (error) throw error
      return data as { source_file_url: string | null } | null
    },
    enabled: !!id && !!allAccessPass,
  })

  const handleDownload = async () => {
    if (!downloadInfo?.source_file_url || downloading) return
    setDownloading(true)
    try {
      const cleanUrl = downloadInfo.source_file_url.trim()
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        window.open(getDirectDownloadUrl(cleanUrl), '_blank', 'noopener,noreferrer')
      } else {
        const { data, error } = await supabase.storage
          .from('template-files')
          .createSignedUrl(cleanUrl, 60)
        if (error) throw error
        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = `${template?.title || 'template'}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('preview.downloadFailedDesc')
      toast({
        title: t('preview.downloadFailed'),
        description: message,
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleBuyClick = () => {
    addToCart({
      id: id || '',
      title: template?.title || t('preview.fallbackTitle'),
      image: template?.image_url || '',
      price: template ? Number(template.price) : 59,
      license: 'regular',
    })
    toast({
      title: t('preview.addedToCart'),
      description: t('preview.addedToCartDesc', {
        title: template?.title || t('preview.fallbackTitle'),
      }),
    })
    if (!user) {
      navigate('/auth?redirect=/cart')
    } else {
      navigate('/cart')
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16">
          <div className="container mx-auto max-w-7xl">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-96 mb-6" />
            <Skeleton className="h-[70vh] w-full rounded-xl mb-12" />
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <Skeleton className="h-[400px] w-full rounded-xl" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-[500px] w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !template) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16">
          <div className="container mx-auto text-center">
            <Link
              to="/"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-8 justify-center">
              <ArrowLeft className="w-4 h-4" />
              {t('preview.backToTemplates')}
            </Link>
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              {t('preview.notFoundTitle')}
            </h1>
            <p className="text-muted-foreground">
              {t('preview.notFoundDesc')}
            </p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const liveUrl = template.demo_url

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-[1200px] overflow-hidden">
          {/* Header Section mimicking Webflow Details Page */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
            <div className="flex-1 min-w-0">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Link to="/" className="hover:text-foreground flex items-center gap-1">
                  <Home className="w-3 h-3" />
                </Link>
                <span>›</span>
                <Link to="/templates" className="hover:text-foreground">
                  {t('preview.templates')}
                </Link>
                <span>›</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {template.title}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
                {template.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {template.title.charAt(0)}
                </div>
                <span>{t('preview.studioName')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
              {liveUrl && (
                <Button
                  variant="outline"
                  className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() => setPreviewOpen(true)}>
                  {t('preview.fullscreenPreview')} <Maximize2 className="w-4 h-4" />
                </Button>
              )}
              {allAccessPass ? (
                <>
                  <Button
                    className="bg-[#e85a2d] hover:bg-[#ef7a52] text-white border-none gap-2 w-full sm:w-auto text-xs sm:text-sm"
                    onClick={handleDownload}
                    disabled={downloading || !downloadInfo?.source_file_url}>
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {downloadInfo?.source_file_url
                      ? t('preview.downloadNow')
                      : t('preview.fileUnavailable')}
                  </Button>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e85a2d] bg-[#e85a2d]/5 border border-[#e85a2d]/20 rounded-full px-3 py-1.5">
                    <BadgeCheck className="w-4 h-4" />
                    {t('preview.includedInPass')}
                  </span>
                </>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 w-full sm:w-auto text-xs sm:text-sm"
                  onClick={handleBuyClick}>
                  <ShoppingBag className="w-4 h-4" />
                  {Number(template.price) > 0
                    ? t('preview.buyFor', { price: template.price })
                    : t('preview.getForFree')}
                </Button>
              )}
            </div>
          </div>

          {/* Embedded Iframe Preview Hero OR Image Fallback */}
          {liveUrl ? (
            <div className="w-full h-[70vh] min-h-[600px] border border-border shadow-lg rounded-lg overflow-hidden bg-muted mb-12 relative flex flex-col">
              {/* Fake browser bar for aesthetics */}
              <div className="h-8 bg-card border-b border-border flex items-center px-4 gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 text-xs text-muted-foreground bg-muted px-4 py-1 rounded-full font-mono truncate max-w-sm">
                  {liveUrl.replace(/^https?:\/\//, '')}
                </div>
              </div>
              <iframe
                src={liveUrl}
                className="w-full flex-1 border-none bg-background"
                title={t('preview.previewTitle', { title: template.title })}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          ) : (
            <div className="w-full h-[70vh] min-h-[600px] border border-border shadow-lg rounded-lg overflow-hidden bg-muted mb-12 relative flex items-center justify-center">
              <img
                src={template.image_url || '/placeholder.svg'}
                alt={t('preview.previewImageAlt', { title: template.title })}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Layout */}
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Main Content (Left Side) */}
            <div className="lg:col-span-8 space-y-12">
              <div className="prose prose-sm md:prose-base max-w-none">
                <h2 className="text-2xl font-bold mb-4">
                  {t('preview.webTemplateTitle', { title: template.title })}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {template.description || t('preview.fallbackDescription')}
                </p>
                <h3 className="text-lg font-bold mb-3">{t('preview.keyFeatures')}</h3>
                <ul className="space-y-2 mb-8 list-disc pl-5">
                  <li>{t('preview.feature1')}</li>
                  <li>{t('preview.feature2')}</li>
                  <li>{t('preview.feature3')}</li>
                </ul>
              </div>

              <TemplateGallery template={template} />
              <TemplateFeatures features={template.features || []} />
              <TemplateTechStack techStack={template.tech_stack || []} />
              <ReviewSection templateId={id || ''} />
            </div>

            {/* Sidebar (Right Side) */}
            <div className="lg:col-span-4">
              <TemplateSidebar />
            </div>
          </div>

          <RelatedTemplates />
        </div>
      </div>

      <Footer />

      {liveUrl && (
        <FullScreenPreview
          url={liveUrl}
          title={template.title}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </main>
  )
}

export default TemplatePreview
