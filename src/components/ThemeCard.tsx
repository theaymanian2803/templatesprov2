import { useState } from 'react'
import { ArrowRight, ShoppingCart, Star } from 'lucide-react'
import { Link, useNavigate } from '@/lib/router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/contexts/CartContext'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

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

  const rating = getPlaceholderRating(template.id)
  const reviewCount = getPlaceholderReviewCount(template.id)

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative h-full rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#e85a2d]/40 transition-colors">
      {/* brand hover halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(70% 60% at 100% 0%, rgba(232,90,45,0.08) 0%, rgba(232,90,45,0) 60%)',
        }}
      />

      <Link to={`/template/${template.id}`} className="flex h-full flex-col">
        {/* Thumbnail — the only overflow-hidden surface, corners rounded here */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-[#F5F4F0]">
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

        <div className="relative flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="font-slab font-bold text-[#111111] text-sm leading-snug line-clamp-2 mb-1 group-hover:text-[#e85a2d] transition-colors">
            {template.title}
          </h3>
          <p className="text-xs text-[#787774] mb-3">{t('themeCard.by')} Unccodestore</p>

          {/* Meta row — flex-wrap guarantees it never overflows the card body */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs font-bold text-[#111111]">
              ${Number(template.price).toFixed(0)}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s < Math.floor(rating)
                      ? 'fill-[#e85a2d] text-[#e85a2d]'
                      : rating % 1 !== 0 && s === Math.floor(rating)
                      ? 'fill-[#e85a2d]/50 text-[#e85a2d]'
                      : 'text-[#EAEAEA]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#787774]">({reviewCount})</span>
          </div>

          {/* Action row — its own always-visible line, flexes to any card width */}
          <div className="mt-3 pt-3 border-t border-[#EAEAEA]/70 flex items-center gap-2">
            <button
              onClick={handleReadMore}
              className="inline-flex h-10 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-[#EAEAEA] text-[11px] font-semibold text-[#2F3437] hover:border-[#e85a2d] hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
              <span className="truncate">{t('themeCard.readMore')}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              onClick={handleAddToCart}
              aria-label={isInCart(template.id) ? t('themeCard.inCart') : t('themeCard.addToCart')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#EAEAEA] text-[#2F3437] hover:border-[#e85a2d] hover:text-[#e85a2d] hover:bg-[#ef7a52]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export const ThemeCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-[#EAEAEA]">
    <Skeleton className="aspect-[16/10] w-full bg-[#F5F4F0]" />
    <div className="p-4 sm:p-5 space-y-3">
      <Skeleton className="h-4 w-3/4 bg-[#F5F4F0]" />
      <Skeleton className="h-3 w-1/2 bg-[#F5F4F0]" />
      <div className="flex justify-between pt-1">
        <Skeleton className="h-4 w-16 bg-[#F5F4F0]" />
        <Skeleton className="h-6 w-20 bg-[#F5F4F0]" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-10 flex-1 bg-[#F5F4F0]" />
        <Skeleton className="h-10 w-10 bg-[#F5F4F0]" />
      </div>
    </div>
  </div>
)

export default ThemeCard