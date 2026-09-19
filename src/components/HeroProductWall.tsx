import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { topTemplates } from '@/data/topTemplates'

/*
  EDITORIAL PRODUCT WALL — Direction A.

  A static bento collage of the top 4 templates rendered from a checked-in manifest
  (src/data/topTemplates.ts) so the hero paints instantly with zero network request.
  Layout: one large hero shot (left), two stacked tiles (top-right), one wide tile
  (bottom-right). Hover lifts each card, warms the border, and reveals a bottom
  gradient with title + price. Every tile deep-links to the real template page.

  Kept deliberately CSS/framer-motion only — no query hooks, no data fetching.
*/

const layout = [
  'lg:row-span-2', // A — large hero shot
  '', // B — top-right
  '', // C — top-right
  'lg:col-span-2', // D — wide bottom-right
]

const eagerIndex = 0 // the large hero shot is the LCP candidate

const HeroProductWall = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[30rem] md:max-w-[33rem] lg:max-w-[38rem] mx-auto">
      {/* soft cold-orange halo behind the wall */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[2rem] blur-2xl opacity-40"
        style={{
          background:
            'radial-gradient(60% 60% at 70% 20%, rgba(239,122,82,0.12) 0%, rgba(239,122,82,0) 70%)',
        }}
      />

      <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 aspect-[4/3] lg:aspect-auto lg:h-[34rem]">
        {topTemplates.map((t, i) => (
          <Link
            key={t.id}
            to={`/template/${t.id}`}
            aria-label={`View template: ${t.title}`}
            className={`group relative rounded-xl overflow-hidden border border-[#EAEAEA] bg-white shadow-[0_16px_48px_-20px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-[#ef7a52]/40 hover:shadow-[0_28px_70px_-26px_rgba(232,90,45,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50 ${layout[i]}`}>
            <img
              src={t.image_url}
              alt={t.title}
              loading={i === eagerIndex ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />

            {/* readability gradient + caption — revealed on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-white sm:text-xs">
                  {t.title}
                </p>
                <p className="text-[10px] text-white/70">{t.category}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-[#111111] backdrop-blur-sm">
                ${t.price.toFixed(0)}
                <ArrowUpRight className="w-3 h-3 text-[#e85a2d]" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

export default HeroProductWall