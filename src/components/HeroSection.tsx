import { topTemplates } from '@/data/topTemplates'
import { useTemplates } from '@/hooks/useTemplates'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@/lib/router'

/*
  HERO — redesigned to sell websites + their companion mobile apps (iOS &
  Android). Two-column stage on desktop: copy on the left, a floating phone
  (with a website card peeking behind it) on the right, showing a real
  interactive app screen. Search, actions, popular tags and the trust line
  are preserved.
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
  const stageRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: templates } = useTemplates({ limit: 5 })

  const cards: DeckCard[] = [...(templates ?? []), ...topTemplates]
    .map((c) => ({ id: c.id, title: c.title, image_url: c.image_url, artist: c.category }))
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 5)

  const webImage = cards[1]?.image_url ?? topTemplates[1]?.image_url
  const phoneImage = '/android.png'

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!stageRef.current) return
        const y = Math.min(window.scrollY, 600)
        stageRef.current.style.transform = `translateY(${y * 0.08}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

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

      <div className="hero-shell">
        <div className="hero-copy">
          <div className="hero-badge">
            <Sparkles size={13} /> {t('hero.badge')}
          </div>
          <h1>
            <span>{t('hero.title1')}</span> {t('hero.title2')}
          </h1>
          <p>
            <span>{t('hero.subtitle1')}</span>
            <span>{t('hero.subtitle2')}</span>
          </p>

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
            <a className="hero-button hero-button--primary" href="#catalog">
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

        <div className="hero-visual">
          <div className="device-stage" ref={stageRef}>
            <div className="device-inner">
              <div className="web-card" aria-hidden="true">
                <div className="web-card-top">
                  <span className="web-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="web-url">unccodestore.com</span>
                </div>
                <div className="web-card-body">
                  {failedImgs['web'] ? (
                    <span className="web-fallback" />
                  ) : (
                    <img
                      src={webImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onError={() => setFailedImgs((prev) => ({ ...prev, web: true }))}
                    />
                  )}
                </div>
              </div>

              <div className="phone">
                <div className="phone-notch" aria-hidden="true" />
                <div className="phone-screen">
                  {failedImgs['phone'] ? (
                    <span className="phone-fallback" />
                  ) : (
                    <img
                      className="phone-screen-img"
                      src={phoneImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onError={() => setFailedImgs((prev) => ({ ...prev, phone: true }))}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
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
