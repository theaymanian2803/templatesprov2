import { useState } from 'react'
import { ArrowRight, ShoppingCart, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/contexts/CartContext'
import { Skeleton } from '@/components/ui/skeleton'

export type Template = {
  id: string
  title: string
  price: number | string
  image_url?: string | null
  demo_url?: string | null
}

function seededRandom(seed: string) {
  let s = 0
  for (let i = 0; i < seed.length; i++) {
    s = ((s << 5) - s + seed.charCodeAt(i)) | 0
  }
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const getPlaceholderRating = (templateId: string): number => {
  const rand = seededRandom(templateId)
  return rand() > 0.45 ? 5 : 4.5
}

const getPlaceholderReviewCount = (templateId: string): number => {
  const rand = seededRandom(templateId + '_rc')
  return Math.floor(rand() * 7) + 7
}

const ThemeCard = ({ template, index = 0 }: { template: Template; index?: number }) => {
  const [imgOk, setImgOk] = useState(true)
  const { addToCart, isInCart } = useCart()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/template/${template.id}`)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInCart(template.id)) {
      toast.info(t('themeCard.alreadyInCart'), { description: template.title })
      return
    }
    addToCart({
      id: template.id,
      title: template.title,
      image: template.image_url || '',
      price: Number(template.price),
      license: 'regular',
    })
    toast.success(t('themeCard.addedToCart'), { description: template.title })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl overflow-hidden bg-white border border-[#EAEAEA] hover:border-[#e85a2d]/40 transition-colors">
      {/* brand hover halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(70% 60% at 100% 0%, rgba(232,90,45,0.08) 0%, rgba(232,90,45,0) 60%)',
        }}
      />
      <Link to={`/template/${template.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F4F0]">
          {template.image_url && imgOk ? (
            <img
              src={template.image_url}
              alt={template.title}
              loading="lazy"
              onError={() => setImgOk(false)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              aria-hidden
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(135deg, rgba(232,90,45,0.10) 0%, rgba(245,244,240,1) 70%)',
              }}
            />
          )}
        </div>
        <div className="relative p-5">
          <h3 className="font-slab font-bold text-[#111111] text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-[#e85a2d] transition-colors">
            {template.title}
          </h3>
          <p className="text-xs text-[#787774] mb-4">{t('themeCard.by')} Unccodestore</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#111111]">
                ${Number(template.price).toFixed(0)}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => {
                  const r = getPlaceholderRating(template.id)
                  return (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s < Math.floor(r)
                          ? 'fill-[#e85a2d] text-[#e85a2d]'
                          : r % 1 !== 0 && s === Math.floor(r)
                          ? 'fill-[#e85a2d]/50 text-[#e85a2d]'
                          : 'text-[#EAEAEA]'
                      }`}
                    />
                  )
                })}
              </div>
              <span className="text-[10px] text-[#787774]">
                ({getPlaceholderReviewCount(template.id)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReadMore}
                className="text-[11px] font-semibold text-[#2F3437] border border-[#EAEAEA] rounded px-2.5 py-1.5 hover:border-[#e85a2d] hover:text-[#e85a2d] transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
                {t('themeCard.readMore')}
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={handleAddToCart}
                aria-label={isInCart(template.id) ? t('themeCard.inCart') : t('themeCard.addToCart')}
                className="w-8 h-8 flex items-center justify-center rounded border border-[#EAEAEA] text-[#2F3437] hover:border-[#e85a2d] hover:text-[#e85a2d] hover:bg-[#ef7a52]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export const ThemeCardSkeleton = () => (
  <div className="rounded-xl overflow-hidden bg-white border border-[#EAEAEA]">
    <Skeleton className="aspect-[16/10] w-full bg-[#F5F4F0]" />
    <div className="p-5 space-y-2">
      <Skeleton className="h-4 w-3/4 bg-[#F5F4F0]" />
      <Skeleton className="h-3 w-1/2 bg-[#F5F4F0]" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-16 bg-[#F5F4F0]" />
        <Skeleton className="h-6 w-20 bg-[#F5F4F0]" />
      </div>
    </div>
  </div>
)

// keep motion import live for the card animation even if tree-shaken in some setups
import { motion } from 'framer-motion'

export default ThemeCard
