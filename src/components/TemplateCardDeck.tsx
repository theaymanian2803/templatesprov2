import { Link } from 'react-router-dom'
import { ArrowUpRight, Star } from 'lucide-react'
import { useTemplates } from '@/hooks/useTemplates'

/*
  Cascading "deck of cards" — showcases the top-selling templates as a fanned
  stack. Each card is absolutely positioned with a staggered offset and a slight
  rotation (back tilted left, middles settling, front tilted right). On hover the
  deck spreads: every card scales up a touch and fans apart (bigger horizontal
  offset + rotation + a lift) so the underlying templates are clearly revealed.

  OVERFLOW SAFETY: the horizontal spread is tuned so a card's outer edge stays
  within the deck/column at every breakpoint, and the hero <section> is
  overflow-hidden, so the fan can never cause a page-level horizontal scrollbar
  or shove the layout. The motion is driven by CSS custom properties (--rest /
  --spread) swapped on group-hover, so `transition-all` animates transform +
  shadow smoothly and it also works for touch (tap = hover) without JS handlers.
  All motion is transform/opacity (GPU-friendly; reduced-motion is respected via
  the global MotionConfig + CSS guard). Sizes shrink responsively from md down so
  the deck never overflows small screens.
*/

interface CardSpec {
  restX: number // resting horizontal offset (% of card width)
  restY: number // resting vertical offset (px)
  restRot: number // resting rotation (deg)
  spreadX: number // hover horizontal offset (% of card width)
  spreadRot: number // hover rotation (deg)
  lift: number // extra -Y (px) applied on hover
}

const CARD_SPECS: CardSpec[] = [
  { restX: -12, restY: 30, restRot: -8, spreadX: -30, spreadRot: -12, lift: -12 }, // back
  { restX: -4, restY: 14, restRot: -2.5, spreadX: -11, spreadRot: -5, lift: -26 }, // mid-back
  { restX: 4, restY: 14, restRot: 2.5, spreadX: 11, spreadRot: 5, lift: -26 }, // mid-front
  { restX: 12, restY: 30, restRot: 8, spreadX: 30, spreadRot: 12, lift: -12 }, // front
]

const CARD_COUNT = CARD_SPECS.length

const TemplateCardDeck = () => {
  const { data: templates } = useTemplates({ limit: CARD_COUNT })

  const items = templates?.length
    ? templates.slice(0, CARD_COUNT).map((t) => ({
        id: t.id,
        src: t.image_url || '/placeholder.svg',
        title: t.title,
        rating: t.rating,
        href: `/template/${t.id}`,
      }))
    : CARD_SPECS.map((_, i) => ({
        id: `placeholder-${i}`,
        src: '/placeholder.svg',
        title: 'Template preview',
        rating: null as number | null,
        href: '/templates',
      }))

  return (
    <div className="group relative w-full max-w-[30rem] md:max-w-[33rem] lg:max-w-[36rem] mx-auto">
      {/* soft cold-orange halo behind the deck */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[2rem] blur-2xl opacity-40 transition-opacity duration-500 ease-out group-hover:opacity-70"
        style={{
          background:
            'radial-gradient(60% 60% at 70% 20%, rgba(239,122,82,0.12) 0%, rgba(239,122,82,0) 70%)',
        }}
      />

      {/* the deck — aspect box reserves space so the absolute cards don't collapse it */}
      <div className="relative aspect-[16/10]">
        {items.map((item, i) => {
          const spec = CARD_SPECS[i % CARD_SPECS.length]
          const isFront = i === items.length - 1
          const style = {
            zIndex: i + 1,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            '--rest': `translate(${spec.restX}%, ${spec.restY}px) rotate(${spec.restRot}deg)`,
            '--spread': `translate(${spec.spreadX}%, ${spec.restY + spec.lift}px) rotate(${spec.spreadRot}deg) scale(1.04)`,
          } as React.CSSProperties
          return (
            <Link
              key={item.id}
              to={item.href}
              aria-label={`View template: ${item.title}`}
              style={style}
              className="absolute inset-0 m-auto block w-[72%] rounded-xl border border-[#EAEAEA] bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.22)] overflow-hidden transition-all duration-300 [transform:var(--rest)] group-hover:[transform:var(--spread)] group-hover:shadow-[0_32px_80px_-28px_rgba(232,90,45,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />

              {/* subtle top gradient so the caption stays readable */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              {/* caption chip — appears on hover */}
              <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex max-w-[calc(100%-3.5rem)] items-center gap-1 truncate rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="truncate">{item.title}</span>
                <ArrowUpRight className="w-3 h-3 shrink-0" />
              </span>

              {/* rating chip on the front card only */}
              {isFront && item.rating != null && (
                <span className="pointer-events-none absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-bold text-[#111111] backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-[#e85a2d] text-[#e85a2d]" />
                  {item.rating.toFixed(1)}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default TemplateCardDeck
