import { useTranslation } from 'react-i18next'
import { ArrowRight, MonitorSmartphone } from 'lucide-react'
import { Link } from '@/lib/router'

const WEBSITE_PREVIEW_URL = 'https://animalsfoodprotemplates.unccode.site/'
const WEBSITE_PREVIEW_LABEL = 'animalsfoodprotemplates.unccode.site'

const WebsiteAppShowcase = () => {
  const { t } = useTranslation()

  return (
    <section id="showcase" className="relative bg-[#FBFBFA] py-20 md:py-28 text-[#111111]">
      <div className="container mx-auto max-w-6xl">
        <div className="showcase-composition">
          {/* Website — fills the space, static (no scrolling) */}
          <div className="showcase-browser">
            <div className="showcase-browser-bar">
              <span className="showcase-dots" aria-hidden="true">
                <i className="showcase-dot showcase-dot--r" />
                <i className="showcase-dot showcase-dot--a" />
                <i className="showcase-dot showcase-dot--g" />
              </span>
              <span className="showcase-url">{WEBSITE_PREVIEW_LABEL}</span>
              <span className="showcase-live">
                <span className="showcase-live-dot" aria-hidden="true" />
                {t('showcase.livePreview')}
              </span>
            </div>

            <div className="showcase-viewport">
              <iframe
                src={WEBSITE_PREVIEW_URL}
                title={t('showcase.websiteLabel')}
                loading="lazy"
                scrolling="no"
                tabIndex={-1}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="showcase-iframe"
              />
              <div className="showcase-scrim" aria-hidden="true" />

              {/* Text inside the website */}
              <div className="showcase-copy">
                <span className="showcase-badge">
                  <MonitorSmartphone className="w-3.5 h-3.5" />
                  {t('showcase.badge')}
                </span>
                <h2 className="showcase-title">
                  {t('showcase.title1')} <span className="text-[#e85a2d]">{t('showcase.title2')}</span>
                </h2>
                <p className="showcase-subtitle">{t('showcase.subtitle')}</p>
                <Link to="/templates" className="showcase-cta">
                  {t('showcase.cta')}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile — on top of the website */}
          <div className="showcase-phone">
            <div className="app-phone">
              <span className="app-phone-glow" aria-hidden="true" />
              <span className="app-phone-notch" aria-hidden="true" />
              <div className="app-phone-screen">
                <img src="/android.png" alt={t('showcase.mobileLabel')} loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WebsiteAppShowcase
