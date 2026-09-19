import { topTemplates } from '@/data/topTemplates'
import { useTemplates } from '@/hooks/useTemplates'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

/*
  HERO — bolt-spec centered stage: warm off-white ground, cold-orange radial
  atmosphere, floating tech chips, badge + serif headline, a fanned deck of
  REAL product cards (screenshot + white frame + meta bar) directly beneath
  the copy, then the search instrument, the action buttons and the popular
  tags below the deck, with the trust line at the fold. Search and tags
  navigate to /templates?q=..., each card links to /template/:id.
*/

const popularTags = [
  'WordPress',
  'React',
  'Admin Dashboard',
  'Landing Page',
  'eCommerce',
  'Portfolio',
]

const chips = [
  { label: 'React', className: 'chip--react' },
  { label: 'TypeScript', className: 'chip--typescript' },
  { label: 'Tailwind', className: 'chip--tailwind' },
  { label: 'Next.js', className: 'chip--next' },
  { label: 'Supabase', className: 'chip--supabase' },
]

type DeckCard = {
  id: string
  title: string
  image_url: string
  artist: string
}

const HeroSection = () => {
  const [query, setQuery] = useState('')
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { data: templates } = useTemplates({ limit: 5 })
  const isRtl = i18n.dir() === 'rtl'

  const cards: DeckCard[] = [...(templates ?? []), ...topTemplates]
    .map((c) => ({ id: c.id, title: c.title, image_url: c.image_url, artist: c.category }))
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 5)

  const goToTemplates = (value: string) => {
    const params = new URLSearchParams()
    if (value.trim()) params.set('q', value.trim())
    navigate(`/templates${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    goToTemplates(query)
  }

  return (
    <section className="template-hero">
      <style>{`
        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1rem;
        }
        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 280px;
          margin: 0.75rem auto 1.25rem;
        }
        .hero-button {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          width: 100%;
          box-sizing: border-box;
        }
        .hero-search {
          width: 100%;
          max-width: 500px;
          margin: 0 auto 0.75rem;
        }
        .popular-tags {
          margin-bottom: 1rem;
        }
        
        /* Centered Card Stage Layout — sits between the copy and the search.
           Top headroom covers the full hover-growth of the lifted card so it
           never clips (3.5rem keeps the hover in the same range it shipped with). */
        .card-stage {
          padding: 3rem 0 1.25rem;
          overflow: hidden;
          width: 100%;
        }
        .card-deck {
          position: relative;
          height: 380px;
          max-width: 1000px;
          margin: 0 auto;
        }
        /* The wrapper is the stable hover target — it NEVER moves on hover, so
           :hover can't be lost mid-animation (that was the flicker). The outer
           transform now animates too so the fan-open parting is smooth. */
        .template-card {
          position: absolute;
          /* Absolute centering technique */
          left: 50%;
          width: 260px;
          height: 300px;
          margin-left: -130px; /* Exactly half of the width to anchor the true center */
          top: 0;
          color: inherit;
          text-decoration: none;
          background: transparent;
          border: none;
          box-shadow: none;
          overflow: visible;
          outline: none;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        /* The inner card carries the frame and gets the hover growth. */
        .template-card-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 5px solid #fff;
          border-radius: 16px;
          background: #d8d5d0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transform-origin: bottom center;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease;
          will-change: transform;
        }
        .template-card-inner .template-visual {
          flex: 1 1 auto;
          height: auto;
          min-height: 0;
        }
        .template-card-inner .template-meta {
          flex: 0 0 auto;
        }

        /* Strict Symmetrical Fanning */
        .template-card:nth-child(1) { transform: translateX(-105%) translateY(35px) rotate(-14deg); z-index: 1; }
        .template-card:nth-child(2) { transform: translateX(-52%) translateY(12px) rotate(-7deg); z-index: 2; }
        .template-card:nth-child(3) { transform: translateX(0) translateY(0) rotate(0deg); z-index: 3; }
        .template-card:nth-child(4) { transform: translateX(52%) translateY(12px) rotate(7deg); z-index: 2; }
        .template-card:nth-child(5) { transform: translateX(105%) translateY(35px) rotate(14deg); z-index: 1; }

        /* Hover focus: the hovered card straightens, lifts and grows well above its
           neighbours, and its z-index jumps above them. Because only the inner
           card animates its growth, the hover state itself stays rock-solid. */
        .template-card:hover { z-index: 40; }
        .template-card:hover .template-card-inner {
          transform: translateY(-28px) rotate(0deg) scale(1.22);
          box-shadow: 0 36px 64px -18px rgba(232,90,45,0.38), 0 14px 28px -10px rgba(0,0,0,0.28);
        }
        /* Fan-open: while one card is focused, the deck parts around it —
           outer cards nudge outward and tilt a little more, the center card
           dips slightly. Nothing dims: every card stays fully opaque, so the
           lifted card reads as the spotlight of the fan. */
        .card-deck:has(.template-card:hover) .template-card:not(:hover) { z-index: 1; }
        .card-deck:has(.template-card:hover) .template-card:nth-child(1):not(:hover) { transform: translateX(-122%) translateY(28px) rotate(-17deg); }
        .card-deck:has(.template-card:hover) .template-card:nth-child(2):not(:hover) { transform: translateX(-59%) translateY(10px) rotate(-8.5deg); }
        .card-deck:has(.template-card:hover) .template-card:nth-child(3):not(:hover) { transform: translateY(4px) rotate(0deg); }
        .card-deck:has(.template-card:hover) .template-card:nth-child(4):not(:hover) { transform: translateX(59%) translateY(10px) rotate(8.5deg); }
        .card-deck:has(.template-card:hover) .template-card:nth-child(5):not(:hover) { transform: translateX(122%) translateY(28px) rotate(17deg); }
        .template-card:focus-visible .template-card-inner {
          box-shadow: 0 0 0 3px rgba(232,90,45,0.65), 0 36px 64px -18px rgba(232,90,45,0.38);
        }

        /* Responsive Adjustments */
        @media (min-width: 640px) {
          .hero-actions {
            flex-direction: row;
            max-width: 450px;
            gap: 1rem;
          }
        }
        @media (max-width: 768px) {
          .card-deck {
            height: 280px;
          }
          .template-card {
            width: 180px;
            height: 210px;
            margin-left: -90px; /* Exactly half of the mobile width */
          }
          .template-card:nth-child(1) { transform: translateX(-70%) translateY(25px) rotate(-12deg); }
          .template-card:nth-child(2) { transform: translateX(-35%) translateY(10px) rotate(-6deg); }
          .template-card:nth-child(3) { transform: translateX(0) translateY(0) rotate(0deg); }
          .template-card:nth-child(4) { transform: translateX(35%) translateY(10px) rotate(6deg); }
          .template-card:nth-child(5) { transform: translateX(70%) translateY(25px) rotate(12deg); }
          /* Mobile fan-open — scaled-down version of the parting motion */
          .card-deck:has(.template-card:hover) .template-card:nth-child(1):not(:hover) { transform: translateX(-82%) translateY(22px) rotate(-15deg); }
          .card-deck:has(.template-card:hover) .template-card:nth-child(2):not(:hover) { transform: translateX(-41%) translateY(8px) rotate(-7deg); }
          .card-deck:has(.template-card:hover) .template-card:nth-child(3):not(:hover) { transform: translateY(3px) rotate(0deg); }
          .card-deck:has(.template-card:hover) .template-card:nth-child(4):not(:hover) { transform: translateX(41%) translateY(8px) rotate(7deg); }
          .card-deck:has(.template-card:hover) .template-card:nth-child(5):not(:hover) { transform: translateX(82%) translateY(22px) rotate(15deg); }
        }

        /* RTL — mirror the fan */
        [dir='rtl'] .template-card:nth-child(1) { transform: translateX(105%) translateY(35px) rotate(14deg); }
        [dir='rtl'] .template-card:nth-child(2) { transform: translateX(52%) translateY(12px) rotate(7deg); }
        [dir='rtl'] .template-card:nth-child(4) { transform: translateX(-52%) translateY(12px) rotate(-7deg); }
        [dir='rtl'] .template-card:nth-child(5) { transform: translateX(-105%) translateY(35px) rotate(-14deg); }
        /* RTL fan-open — mirror the parting */
        [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(1):not(:hover) { transform: translateX(122%) translateY(28px) rotate(17deg); }
        [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(2):not(:hover) { transform: translateX(59%) translateY(10px) rotate(8.5deg); }
        [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(4):not(:hover) { transform: translateX(-59%) translateY(10px) rotate(-8.5deg); }
        [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(5):not(:hover) { transform: translateX(-122%) translateY(28px) rotate(-17deg); }
        @media (max-width: 768px) {
          [dir='rtl'] .template-card:nth-child(1) { transform: translateX(70%) translateY(25px) rotate(12deg); }
          [dir='rtl'] .template-card:nth-child(2) { transform: translateX(35%) translateY(10px) rotate(6deg); }
          [dir='rtl'] .template-card:nth-child(4) { transform: translateX(-35%) translateY(10px) rotate(-6deg); }
          [dir='rtl'] .template-card:nth-child(5) { transform: translateX(-70%) translateY(25px) rotate(-12deg); }
          [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(1):not(:hover) { transform: translateX(82%) translateY(22px) rotate(15deg); }
          [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(2):not(:hover) { transform: translateX(41%) translateY(8px) rotate(7deg); }
          [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(4):not(:hover) { transform: translateX(-41%) translateY(8px) rotate(-7deg); }
          [dir='rtl'] .card-deck:has(.template-card:hover) .template-card:nth-child(5):not(:hover) { transform: translateX(-82%) translateY(22px) rotate(-15deg); }
        }
      `}</style>

      <div className="hero-ambient" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-accents" aria-hidden="true">
        <span className="accent-orb accent-orb--left" />
        <span className="accent-orb accent-orb--right" />
        <span className="accent-orb accent-orb--center" />
        <span className="accent-ring accent-ring--one" />
        <span className="accent-ring accent-ring--two" />
        <span className="accent-dash accent-dash--one" />
        <span className="accent-dash accent-dash--two" />
      </div>
      <div className="floating-chips" aria-hidden="true">
        {chips.map((chip) => (
          <span className={`floating-chip ${chip.className}`} key={chip.label}>
            {chip.label}
          </span>
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={13} /> {t('hero.badge')}
        </div>
        <h1>
          <span className="sr-only">
            {t('hero.title1')} {t('hero.title2')}
          </span>
          <span className="hero-arch-wrap">
            <svg className="hero-arch" viewBox="0 0 1000 156" aria-hidden="true">
              <defs>
                <path
                  id="hero-arch-path"
                  d={isRtl ? 'M 970 140 Q 500 40 30 140' : 'M 30 140 Q 500 40 970 140'}
                />
              </defs>
              <text>
                <textPath href="#hero-arch-path" startOffset="50%" textAnchor="middle">
                  <tspan fill="#e85a2d">{t('hero.title1')}</tspan>
                  {' '}
                  {t('hero.title2')}
                </textPath>
              </text>
            </svg>
          </span>
        </h1>
        <p>
          <span>{t('hero.subtitle1')}</span>
          <span>{t('hero.subtitle2')}</span>
        </p>
      </div>

      <div className="card-stage" id="featured" role="group" aria-label={t('card.deckAria')}>
        <div className="card-deck">
          {cards.map((card, index) => (
            <Link
              to={`/template/${card.id}`}
              aria-label={t('card.view', { title: card.title })}
              className={`template-card ${failedImgs[card.id] ? 'template-card--fallback' : ''}`}
              key={card.id}>
              <div className="template-card-inner">
                <div className="template-visual">
                  <span className="visual-label">{String(index + 1).padStart(2, '0')}</span>
                  <span className="visual-window">
                    <i />
                    <i />
                    <i />
                  </span>
                  {failedImgs[card.id] ? (
                    <>
                      <span className="visual-fallback" />
                      <span className="visual-title">{card.title}</span>
                    </>
                  ) : (
                    <img
                      src={card.image_url}
                      alt=""
                      loading={index === 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      onError={() =>
                        setFailedImgs((prev) => (prev[card.id] ? prev : { ...prev, [card.id]: true }))
                      }
                    />
                  )}
                </div>
                <div className="template-meta">
                  <strong>{card.title}</strong>
                  <span>{card.artist}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="hero-content">
        <form className="hero-search" onSubmit={onSearch} role="search">
          <Search size={18} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('common.searchPlaceholder')}
            aria-label={t('common.search')}
          />
          <button type="submit">
            <span>{t('common.search')}</span>
            <ArrowRight size={15} className="rtl:rotate-180" />
          </button>
        </form>
        <div className="hero-actions">
          <a className="hero-button hero-button--primary" href="#featured">
            {t('hero.discoverMore')} <ArrowRight size={15} className="rtl:rotate-180" />
          </a>
          <Link className="hero-button hero-button--secondary" to="/templates">
            {t('hero.allCollections')} <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </div>
        <div className="popular-tags">
          <span>{t('hero.popular')}</span>
          {popularTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => {
                setQuery(tag)
                goToTemplates(tag)
              }}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="hero-trust">
        <span>
          <b /> {t('hero.trust1')}
        </span>
        <span>
          <b /> {t('hero.trust2')}
        </span>
        <span>
          <b /> {t('hero.trust3')}
        </span>
        <Link to="/templates">
          {t('hero.browseCatalog')} <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    </section>
  )
}

export default HeroSection
