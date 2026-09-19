import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTemplates } from '@/hooks/useTemplates'

const categoriesData = [
  { title: 'WordPress Themes', descKey: 'categories.wpThemesDesc' },
  { title: 'eCommerce Templates', descKey: 'categories.ecommerceDesc' },
  { title: 'Site Templates', descKey: 'categories.siteTemplatesDesc' },
  { title: 'Marketing Templates', descKey: 'categories.marketingDesc' },
  { title: 'CMS Templates', descKey: 'categories.cmsDesc' },
  { title: 'Blogging', descKey: 'categories.bloggingDesc' },
]

const CategoryCard = ({ category, index }: { category: typeof categoriesData[0]; index: number }) => {
  const { data: templates, isLoading } = useTemplates({ category: category.title, limit: 3 })
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative bg-white border border-[#EAEAEA] rounded-xl overflow-hidden hover:border-[#e85a2d]/40 transition-colors">
      {/* brand corner glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(70% 60% at 100% 0%, rgba(239,122,82,0.06) 0%, rgba(239,122,82,0) 60%)',
        }}
      />
      {/* Header */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-slab text-lg font-bold text-[#111111] leading-snug">{category.title}</h3>
          <ArrowUpRight className="w-4 h-4 text-[#787774]/50 group-hover:text-[#e85a2d] transition-colors shrink-0" />
        </div>
        <p className="text-sm text-[#787774] leading-relaxed mb-4">{t(category.descKey)}</p>
        <div className="flex items-center gap-3 text-xs">
          <Link
            to={`/templates?category=${encodeURIComponent(category.title)}&sort=newest`}
            className="text-[#e85a2d] hover:text-[#d14e24] font-medium transition-colors">
            {t('categories.newest')}
          </Link>
          <span className="h-3 w-px bg-[#EAEAEA]" />
          <Link
            to={`/templates?category=${encodeURIComponent(category.title)}&sort=bestsellers`}
            className="text-[#e85a2d] hover:text-[#d14e24] font-medium transition-colors">
            {t('categories.bestsellers')}
          </Link>
        </div>
      </div>

      {/* Preview images */}
      <div className="relative px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {templates?.slice(0, 3).map((t) => (
            <Link
              key={t.id}
              to={`/template/${t.id}`}
              className="block aspect-[4/3] rounded-lg overflow-hidden bg-[#F4F4F2] border border-[#EAEAEA]">
              <img
                src={t.image_url || '/placeholder.svg'}
                alt={t.title}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </Link>
          ))}
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-[#F4F4F2] border border-[#EAEAEA] animate-pulse" />
            ))}
        </div>
      </div>
    </motion.div>
  )
}

const CategoriesSection = () => {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden bg-[#FBFBFA] py-20 md:py-24 text-[#111111]">

      <div className="relative container mx-auto">
        <div className="max-w-2xl mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-[#ef7a52]/20 bg-[#ef7a52]/5 px-3 py-1.5 mb-5 text-[11px] font-medium tracking-wide text-[#e85a2d]">
            {t('categories.badge')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-slab font-bold text-3xl md:text-5xl text-[#111111] leading-[1.05] tracking-tight">
            {t('categories.title1')} <span className="text-[#e85a2d]">{t('categories.title2')}</span> {t('categories.title3')}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categoriesData.map((category, index) => (
            <CategoryCard key={category.title} category={category} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#EAEAEA] text-[#111111] font-semibold text-sm rounded-lg hover:bg-[#f5f5f3] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
            {t('categories.viewAll')}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default CategoriesSection
