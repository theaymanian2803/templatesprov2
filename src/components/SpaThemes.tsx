import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Template } from '@/hooks/useTemplates'
import ThemeCard, { ThemeCardSkeleton } from '@/components/ThemeCard'

const SpaThemes = () => {
  const { t } = useTranslation()
  const { data: templates, isLoading } = useQuery({
    queryKey: ['spa-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or('title.ilike.*spa*,features.cs.{spa},tech_stack.cs.{spa}')
        .order('sales', { ascending: false })
        .limit(4)

      if (error) throw error
      return data as Template[]
    },
  })

  if (!isLoading && (!templates || templates.length === 0)) return null

  return (
    <section className="relative overflow-hidden py-20 md:py-24 text-[#111111]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #FBFBFA 0%, #FBFBFA 100%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 50% at 50% 100%, rgba(239,122,82,0.04) 0%, rgba(239,122,82,0) 55%)',
        }}
      />

      <div className="relative container mx-auto z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-[#e85a2d]/25 bg-[#e85a2d]/5 px-3 py-1.5 mb-6 text-[11px] font-medium tracking-wide text-[#e85a2d]/90">
              <Sparkles className="w-3.5 h-3.5" />
              {t('spa.badge')}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="font-slab font-bold text-3xl md:text-5xl text-[#111111] leading-[1.08] tracking-tight mb-4">
              {t('spa.title1')} <span className="text-[#e85a2d]">{t('spa.title2')}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="text-base text-[#787774] max-w-xl mx-auto leading-relaxed">
              {t('spa.subtitle')}
            </motion.p>
          </div>

          {/* Cards Grid — reuse ThemeCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ThemeCardSkeleton key={i} />)
              : templates?.slice(0, 4).map((template, index) => (
                  <ThemeCard key={template.id} template={template} index={index} />
                ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mt-10">
            <Link
              to="/templates?category=E-commerce&q=spa"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e85a2d] text-white font-semibold text-sm rounded-lg hover:bg-[#d94523] transition-colors shadow-[0_0_30px_-8px_rgba(232,90,45,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
              {t('spa.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default SpaThemes
