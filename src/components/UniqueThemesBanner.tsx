import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTemplates } from '@/hooks/useTemplates'

const UniqueThemesBanner = () => {
  const { data: templates, isLoading } = useTemplates({ limit: 6 })
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden py-20 md:py-24 text-[#111111]">
      {/* subtle warm lit ground, light from the left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #FBFBFA 0%, #F6F5F2 100%), radial-gradient(80% 60% at 0% 50%, rgba(239,122,82,0.04) 0%, rgba(239,122,82,0) 55%)',
        }}
      />

      <div className="relative container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto">
          {/* Left: Thumbnail grid — lit artifact wall */}
          <div className="flex-1 w-full">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-4">
              {templates?.slice(0, 6).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white border border-[#EAEAEA] hover:border-[#e85a2d]/40 transition-colors">
                  <img
                    src={t.image_url || '/placeholder.svg'}
                    alt={t.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'radial-gradient(70% 60% at 50% 0%, rgba(239,122,82,0.06) 0%, rgba(239,122,82,0) 60%)',
                    }}
                  />
                </motion.div>
              ))}
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-lg bg-white border border-[#EAEAEA] animate-pulse" />
                ))}
            </motion.div>
          </div>

          {/* Right: Text + CTA */}
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-[#ef7a52]/20 bg-[#ef7a52]/5 px-3 py-1.5 mb-6 text-[11px] font-medium tracking-wide text-[#e85a2d]">
              {t('unique.badge')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-slab font-bold text-3xl md:text-5xl text-[#111111] leading-[1.05] tracking-tight mb-6">
              {t('unique.title1')} <span className="text-[#e85a2d]">{t('unique.title2')}</span> {t('unique.title3')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-[#787774] text-base mb-9 leading-[1.7] max-w-md">
              {t('unique.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}>
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e85a2d] text-white font-semibold text-sm rounded-lg hover:bg-[#d94523] transition-colors shadow-[0_0_30px_-8px_rgba(232,90,45,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
                {t('unique.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UniqueThemesBanner
