import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/contexts/CartContext'

const PromoBanner = () => {
  const { t } = useTranslation()
  const { setAllAccess } = useCart()
  const navigate = useNavigate()
  const inclusions = [
    t('promo.inc1'),
    t('promo.inc2'),
    t('promo.inc3'),
    t('promo.inc4'),
  ]

  const handleGetPass = () => {
    setAllAccess(true)
    navigate('/checkout')
  }

  return (
    <section className="relative overflow-hidden bg-[#FBFBFA] text-[#111111] py-20 md:py-24">
      {/* subtle warm atmospheric light from the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 100% 50%, rgba(239,122,82,0.04) 0%, rgba(239,122,82,0) 55%), radial-gradient(60% 50% at 0% 100%, rgba(232,90,45,0.03) 0%, rgba(251,251,250,0) 60%)',
        }}
      />

      <div className="relative container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14 max-w-7xl mx-auto">
          {/* Left: pitch */}
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-[#ef7a52]/20 bg-[#ef7a52]/5 px-3 py-1.5 mb-6 text-[11px] font-medium tracking-wide text-[#e85a2d]">
              {t('promo.badge')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-slab font-bold text-3xl md:text-5xl text-[#111111] leading-[1.05] tracking-tight mb-5">
              {t('promo.title1')}
              <br />
              <span className="text-[#e85a2d]">{t('promo.title2')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-[#787774] text-base mb-7 leading-[1.7] max-w-md">
              {t('promo.subtitle')}
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-9 max-w-md">
              {inclusions.map((inc) => (
                <li key={inc} className="flex items-center gap-2 text-sm text-[#2F3437]">
                  <Check className="w-4 h-4 text-[#e85a2d] shrink-0" />
                  {inc}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="flex items-center gap-5">
              <button
                onClick={handleGetPass}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e85a2d] text-white font-semibold text-sm rounded-lg hover:bg-[#d94523] transition-colors shadow-[0_0_30px_-8px_rgba(232,90,45,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50 cursor-pointer">
                {t('promo.startNow')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-baseline gap-1.5">
                <span className="font-slab text-3xl font-bold text-[#111111]">$300</span>
                <span className="text-xs text-[#787774]">{t('promo.oneTime')}</span>
              </div>
            </motion.div>
          </div>

          {/* Right: a single lit price-card artifact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative w-full max-w-sm mx-auto lg:mr-0">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-[2rem] blur-2xl opacity-50"
              style={{
                background:
                  'radial-gradient(55% 55% at 70% 30%, rgba(239,122,82,0.08) 0%, rgba(239,122,82,0) 70%)',
              }}
            />
            <div className="relative rounded-2xl border border-[#EAEAEA] bg-white backdrop-blur-sm p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.06),0_0_0_1px_rgba(239,122,82,0.04)]">
              <div className="flex items-center justify-between mb-5">
                {t('promo.allAccess')}
                <span className="text-[11px] text-[#787774] font-mono">{t('promo.lifetime')}</span>
              </div>
              <p className="font-slab text-4xl font-bold text-[#111111] mb-1">$300</p>
              <p className="text-sm text-[#787774] mb-6">{t('promo.ownCatalog')}</p>
              <div className="h-px bg-[#EAEAEA] mb-5" />
              <ul className="flex flex-col gap-3 mb-7">
                {inclusions.map((inc) => (
                  <li key={inc} className="flex items-center gap-3 text-sm text-[#2F3437]">
                    <span className="w-5 h-5 rounded-full bg-[#ef7a52]/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#e85a2d]" />
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleGetPass}
                className="flex w-full items-center justify-center gap-2 py-3.5 bg-[#e85a2d] text-white font-semibold text-sm rounded-lg hover:bg-[#d94523] transition-colors shadow-[0_0_30px_-8px_rgba(232,90,45,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50 cursor-pointer">
                {t('promo.getAccess')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default PromoBanner