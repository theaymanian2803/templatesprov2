import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTemplates } from '@/hooks/useTemplates'
import ThemeCard, { ThemeCardSkeleton } from '@/components/ThemeCard'

const FeaturedThemes = () => {
  const { data: templates, isLoading } = useTemplates({ category: 'sass', limit: 4 })
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden py-20 md:py-24 text-[#111111]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #FBFBFA 0%, #FBFBFA 100%)' }}
      />

      <div className="relative container mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-14 max-w-7xl mx-auto">
          {/* Left: Text */}
          <div className="lg:w-1/3 lg:sticky lg:top-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-400/5 px-3 py-1.5 mb-6 text-[11px] font-medium tracking-wide text-brand-300/90">
              {t('featured.badge')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-slab font-bold text-3xl md:text-5xl text-[#111111] leading-[1.05] tracking-tight mb-4">
              {t('featured.title1')} <span className="text-[#e85a2d]">{t('featured.title2')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-base text-[#787774] mb-8 leading-[1.7]">
              {t('featured.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}>
              <Link
                to="/templates?category=sass"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e85a2d] text-white font-semibold text-sm rounded-lg hover:bg-[#d94523] transition-colors shadow-[0_0_30px_-8px_rgba(232,90,45,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
                {t('featured.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right: 2x2 Grid of theme cards */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ThemeCardSkeleton key={i} />)
                : templates?.slice(0, 4).map((template, index) => (
                    <ThemeCard key={template.id} template={template} index={index} />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedThemes
