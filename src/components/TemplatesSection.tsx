import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTemplates, useCategories } from '@/hooks/useTemplates'
import ThemeCard, { ThemeCardSkeleton } from '@/components/ThemeCard'
import { ArrowUpRight } from 'lucide-react'

const TemplatesSection = () => {
  const { data: categories } = useCategories()
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { data: templates, isLoading } = useTemplates({
    category: activeCategory || undefined,
    limit: 8,
  })

  const allCategories = t('templatesSection.allCategories')
  const categoryTabs = [allCategories, ...(categories || [])]

  return (
    <section className="relative overflow-hidden py-20 md:py-24 text-[#111111]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #FBFBFA 0%, #FBFBFA 100%)' }}
      />

      <div className="relative container mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e85a2d]/25 bg-[#e85a2d]/5 px-3 py-1.5 mb-5 text-[11px] font-medium tracking-wide text-[#e85a2d]/90">
            {t('templatesSection.badge')}
          </span>
          <h2 className="font-slab font-bold text-3xl md:text-5xl text-[#111111] tracking-tight mb-4 leading-[1.1]">
            {t('templatesSection.title1')} <span className="text-[#e85a2d]">{t('templatesSection.title2')}</span>
          </h2>
          <p className="text-base text-[#787774] leading-[1.7]">
            {t('templatesSection.subtitle')}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2.5 mb-12">
          {categoryTabs.map((tab) => {
            const active = (tab === allCategories && activeCategory === null) || activeCategory === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab === allCategories ? null : tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40 ${
                  active
                    ? 'bg-[#e85a2d] text-white'
                    : 'bg-white text-[#111111] border border-[#EAEAEA] hover:border-[#e85a2d]/40 hover:text-[#e85a2d]'
                }`}>
                {tab}
              </button>
            )
          })}
        </motion.div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ThemeCardSkeleton key={i} />)
            : templates?.slice(0, 8).map((template, index) => (
                <ThemeCard key={template.id} template={template} index={index} />
              ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#EAEAEA] text-[#111111] font-semibold text-sm rounded-lg hover:bg-[#F5F4F0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
            {t('templatesSection.viewMore')}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default TemplatesSection
