import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/router'
import { useTranslation } from 'react-i18next'
import { sectionTitleClasses } from '@/lib/landingStyle'
import type { LandingSection } from '@/hooks/useLandingSections'

interface CustomBannerProps {
  section: LandingSection
}

const CustomBanner = ({ section }: CustomBannerProps) => {
  const { t } = useTranslation()
  const config = (section.config ?? {}) as Record<string, any>
  const ctaText = config.cta_text || t('landing.customCta', { defaultValue: 'Explore' })
  const ctaLink = config.cta_link || '/templates'
  const overlayOpacity = typeof config.overlay_opacity === 'number' ? config.overlay_opacity : 0.5
  const backgroundColor = config.background_color || '#111111'

  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[260px] md:min-h-[340px] flex items-center">
        {section.image_url && (
          <img
            src={section.image_url}
            alt={section.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0" style={{ backgroundColor, opacity: overlayOpacity }} />
        <Link to={ctaLink} aria-label={ctaText} className="absolute inset-0 z-[5]" />
        <div className="container mx-auto relative z-10 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-xl text-white">
            {section.title && (
              <h2
                className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-3 ${sectionTitleClasses(config)}`}>
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p className="text-base md:text-lg text-white/80 mb-6 max-w-md">{section.subtitle}</p>
            )}
            <Button size="lg" asChild>
              <Link to={ctaLink}>{ctaText}</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default CustomBanner
