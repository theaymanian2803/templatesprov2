import ContactModal from '@/components/preview/ContactModal'
import YouTubeModal from '@/components/preview/YouTubeModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useToast } from '@/hooks/use-toast'
import { useTemplate } from '@/hooks/useTemplates'
import { Check, Facebook, Linkedin, MessageCircle, Play, Share2, Twitter } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

const TemplateSidebar = () => {
  const { id } = useParams()
  const templateId = id || ''
  const { data: template } = useTemplate(templateId)
  const { addToCart, isInCart } = useCart()
  const { user } = useAuth()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [videoOpen, setVideoOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  const inCart = isInCart(templateId)
  const isFav = isFavorite(templateId)

  const handleAddToCart = () => {
    addToCart({
      id: templateId,
      title: template?.title || t('sidebar.fallbackTitle'),
      image: template?.image_url || '',
      price: template ? Number(template.price) : 59,
      license: 'regular',
    })

    toast({
      title: inCart ? t('sidebar.cartUpdated') : t('sidebar.addedToCart'),
      description: inCart
        ? t('sidebar.cartUpdatedDesc')
        : t('sidebar.addedToCartDesc', {
            title: template?.title || t('sidebar.fallbackTitle'),
          }),
    })
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: t('sidebar.loginRequired'),
        description: t('sidebar.loginRequiredDesc'),
        variant: 'destructive',
      })
      return
    }

    await toggleFavorite(templateId)
    toast({
      title: isFav ? t('sidebar.removedFromFavorites') : t('sidebar.addedToFavorites'),
      description: isFav
        ? t('sidebar.removedFromFavoritesDesc')
        : t('sidebar.addedToFavoritesDesc'),
    })
  }

  return (
    <>
      <div className="sticky top-24 space-y-8">
        {/* Dynamic Category Section */}
        {template?.category && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">{t('sidebar.category')}</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant="secondary"
                className="bg-muted hover:bg-muted font-normal rounded text-xs px-3 py-1 text-foreground/80">
                {template.category}
              </Badge>
            </div>
          </div>
        )}

        {/* Dynamic Features Checklist */}
        {template?.features && template.features.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground mb-4 text-sm">{t('sidebar.features')}</h4>
            <ul className="space-y-3">
              {template.features.slice(0, 8).map((feature: string, index: number) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm text-foreground/80 py-1 border-b border-border/50 last:border-0">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="line-clamp-1">{feature}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Share Section */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-semibold text-foreground mb-3 text-sm">{t('sidebar.share')}</h4>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="w-4 h-4" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <Button
            variant={inCart ? 'secondary' : 'default'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleAddToCart}>
            {inCart ? t('sidebar.inCart') : t('sidebar.addToCart')}
          </Button>

          <Button variant="outline" className="w-full" onClick={handleToggleFavorite}>
            {isFav ? t('sidebar.removeFromWishlist') : t('sidebar.addToWishlist')}
          </Button>

          {template?.youtube_id && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setVideoOpen(true)}>
              <Play className="w-4 h-4 mr-2" /> {t('sidebar.watchVideoTutorial')}
            </Button>
          )}

          <Button
            variant="link"
            className="w-full text-muted-foreground text-xs"
            onClick={() => setContactOpen(true)}>
            <MessageCircle className="w-3 h-3 mr-2" /> {t('sidebar.contactSupport')}
          </Button>
        </div>
      </div>

      {template?.youtube_id && (
        <YouTubeModal
          youtubeId={template.youtube_id}
          open={videoOpen}
          onOpenChange={setVideoOpen}
        />
      )}

      <ContactModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        templateId={templateId}
        templateTitle={template?.title}
      />
    </>
  )
}

export default TemplateSidebar
