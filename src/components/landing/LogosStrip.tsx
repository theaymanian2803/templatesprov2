import { motion } from 'framer-motion'
import { titleAlignClass } from '@/lib/landingStyle'
import type { LandingSection } from '@/hooks/useLandingSections'
import type { LandingLogo } from '@/lib/landingSections'

interface LogosStripProps {
  section: LandingSection
}

const LogosStrip = ({ section }: LogosStripProps) => {
  const logos = (Array.isArray(section.config?.logos) ? section.config.logos : []) as LandingLogo[]
  if (logos.length === 0) return null

  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="container mx-auto py-10">
        {section.title && (
          <h2
            className={`text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6 ${titleAlignClass(section.config?.title_align)}`}>
            {section.title}
          </h2>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo, i) => {
            const img = (
              <motion.img
                key={logo.image}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                src={logo.image}
                alt={logo.alt || ''}
                loading="lazy"
                className="h-8 md:h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            )
            return logo.link ? (
              <a key={i} href={logo.link} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            ) : (
              <span key={i}>{img}</span>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LogosStrip
