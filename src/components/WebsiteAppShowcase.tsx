import { useTranslation } from 'react-i18next'
import { MonitorSmartphone, Smartphone } from 'lucide-react'

const WEBSITE_PREVIEW_URL = 'https://animalsfoodprotemplates.unccode.site/'
const WEBSITE_PREVIEW_LABEL = 'animalsfoodprotemplates.unccode.site'

const WebsiteAppShowcase = () => {
  const { t } = useTranslation()

  return (
    <section id="showcase" className="relative overflow-hidden bg-[#FBFBFA] py-24 text-[#111111]">
      <div className="relative container mx-auto max-w-6xl">
        <div className="max-w-2xl mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ef7a52]/25 bg-[#ef7a52]/5 px-3 py-1.5 mb-5 text-[11px] font-medium tracking-wide text-[#e85a2d]">
            <MonitorSmartphone className="w-3.5 h-3.5" />
            {t('showcase.badge')}
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-[1.08] tracking-tight">
            {t('showcase.title1')} <span className="text-[#e85a2d]">{t('showcase.title2')}</span>
          </h2>
          <p className="text-[#787774] mt-5 text-base md:text-lg leading-relaxed">
            {t('showcase.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Website — live preview in browser chrome */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-[#787774]">
              <MonitorSmartphone className="w-4 h-4 text-[#e85a2d]" />
              {t('showcase.websiteLabel')}
              <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold normal-case tracking-normal text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('showcase.livePreview')}
              </span>
            </div>
            <div className="rounded-2xl border border-[#EAEAEA] bg-white shadow-[0_40px_90px_-40px_rgba(20,18,16,0.28)] overflow-hidden">
              <div className="h-9 bg-[#F5F4F0] border-b border-[#EAEAEA] flex items-center gap-2 px-4">
                <span className="flex gap-1.5">
                  <i className="w-2.5 h-2.5 rounded-full bg-[#f0a09a]" />
                  <i className="w-2.5 h-2.5 rounded-full bg-[#f0d59a]" />
                  <i className="w-2.5 h-2.5 rounded-full bg-[#a7d8a7]" />
                </span>
                <span className="ml-3 flex-1 truncate text-[11px] text-[#98938c] bg-white border border-[#EAEAEA] rounded-full px-3 py-1 font-mono">
                  {WEBSITE_PREVIEW_LABEL}
                </span>
              </div>
              <iframe
                src={WEBSITE_PREVIEW_URL}
                title={t('showcase.websiteLabel')}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-[380px] sm:h-[440px] border-none bg-white"
              />
            </div>
          </div>

          {/* Mobile — 3D phone mockup */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-[#787774]">
              <Smartphone className="w-4 h-4 text-[#e85a2d]" />
              {t('showcase.mobileLabel')}
            </div>
            <div className="showcase-stage">
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
      </div>
    </section>
  )
}

export default WebsiteAppShowcase
