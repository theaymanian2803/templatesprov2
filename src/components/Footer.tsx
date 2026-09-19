import { Twitter, Instagram, Linkedin, Github, Youtube, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const footerLinkKeys: Record<string, { key: string; to: string }[]> = {
  footerBrowse: [
    { key: 'footer.allTemplates', to: '/templates' },
    { key: 'footer.featuredThemes', to: '/templates?featured=true' },
    { key: 'footer.bestSellers', to: '/templates?sort=bestsellers' },
    { key: 'footer.newestItems', to: '/templates?sort=newest' },
  ],
  footerCompany: [
    { key: 'footer.aboutUs', to: '/about' },
    { key: 'footer.contactUs', to: '/contact' },
    { key: 'footer.faq', to: '/faq' },
  ],
  footerHelpLegal: [
    { key: 'footer.helpCenter', to: '/faq' },
    { key: 'footer.license', to: '/license' },
    { key: 'footer.refunds', to: '/refunds' },
    { key: 'footer.privacyPolicy', to: '/privacy' },
  ],
  footerAccount: [
    { key: 'footer.dashboard', to: '/dashboard' },
    { key: 'footer.myDownloads', to: '/downloads' },
    { key: 'footer.favorites', to: '/favorites' },
    { key: 'footer.shoppingCart', to: '/cart' },
  ],
}

const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#F5F4F0] text-[#111111] pt-16">
      {/* subtle brand glow from the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 30% at 50% 0%, rgba(239,122,82,0.06) 0%, rgba(245,244,240,0) 50%)',
        }}
      />

      <div className="relative container mx-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#e85a2d] flex items-center justify-center shadow-[0_0_24px_-4px_rgba(232,90,45,0.6)]">
                <span className="text-white font-extrabold text-lg">U</span>
              </div>
              <span className="font-slab font-bold text-xl text-[#111111] tracking-tight">Unccodestore</span>
            </Link>
            <p className="text-[#787774] mb-6 max-w-xs leading-relaxed text-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Github, label: 'GitHub' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-[#F5F4F0] border border-[#EAEAEA] flex items-center justify-center text-[#787774] hover:bg-[#ef7a52]/10 hover:border-[#ef7a52]/40 hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinkKeys).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-[11px] uppercase tracking-widest text-[#787774]/70 mb-4">
                {t(title)}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.key}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#787774] hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-[#EAEAEA] py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="font-slab font-bold text-lg text-[#111111] mb-1">{t('footer.newsletterTitle')}</h3>
              <p className="text-sm text-[#787774]">
                {t('footer.newsletterDesc')}
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787774]/60" />
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full h-11 pl-11 pr-4 rounded-lg bg-white border border-[#EAEAEA] text-sm text-[#111111] placeholder:text-[#787774]/50 focus:outline-none focus:border-[#e85a2d]/50 focus:ring-2 focus:ring-[#e85a2d]/15 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg bg-[#e85a2d] text-white font-semibold text-sm hover:bg-[#ef7a52] transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/50">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-[#EAEAEA] z-10">
        <div className="container mx-auto py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#787774]/60 text-sm">
          <p>{t('footer.rights', { year })}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">{t('footer.terms')}</Link>
            <Link to="/cookies" className="hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">{t('footer.cookies')}</Link>
            <Link to="/license" className="hover:text-[#e85a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40">{t('footer.license')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
