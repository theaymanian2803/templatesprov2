import { useCategories } from '@/hooks/useTemplates'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAllAccessPass, ALL_ACCESS_PRICE } from '@/hooks/useAllAccessPass'
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Crown,
  Layers,
  ShoppingCart,
  Rocket,
  Palette,
  Code2,
  LayoutDashboard,
  Smartphone,
  Shield,
  FileText,
  HelpCircle,
  Users,
  Mail,
  BookOpen,
  Download,
  Library,
  FileCheck,
  Sparkles,
  Star,
  CreditCard,
  FileBarChart,
  Heart,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const categoryIconMap: Record<string, typeof ShoppingCart> = {
  'E-Commerce': ShoppingCart,
  'SaaS': Rocket,
  'Admin Templates': LayoutDashboard,
  'Portfolio': Palette,
  'Landing Pages': Layers,
  'UI Kits': Palette,
  'Code': Code2,
  'Mobile Apps': Smartphone,
  'WordPress Themes': FileText,
  'eCommerce Templates': ShoppingCart,
  'Site Templates': Layers,
  'Marketing Templates': Rocket,
  'CMS Templates': LayoutDashboard,
  'Blogging': FileText,
}

const getCategoryIcon = (cat: string) => {
  return categoryIconMap[cat] || LayoutDashboard
}

const userMenuItemClasses =
  'cursor-pointer text-[#2F3437] hover:bg-[#EDEBE4] hover:text-[#111111] focus:bg-[#EDEBE4] focus:text-[#111111] transition-colors'

const signOutMenuItemClasses =
  'cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors'

const MegaMenuItem = ({
  icon: Icon,
  title,
  desc,
  to,
  onClick,
}: {
  icon: typeof ShoppingCart
  title: string
  desc: string
  to: string
  onClick?: () => void
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-[#F5F4F0] transition-colors group">
    <div className="w-9 h-9 rounded-lg bg-brand-400/10 flex items-center justify-center shrink-0 group-hover:bg-brand-400/20 transition-colors">
      <Icon className="w-4 h-4 text-brand-400" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#111111]">{title}</p>
      <p className="text-xs text-[#787774] leading-snug">{desc}</p>
    </div>
  </Link>
)

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null)
  const { user, signOut } = useAuth()
  const { totalItems, setAllAccess } = useCart()
  const { favorites } = useFavorites()
  const { data: allAccessPass } = useAllAccessPass()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: categories } = useCategories()

  useEffect(() => {
    const onScroll = () => setOpenMegaMenu(null)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isAdmin = user?.email === 'theaymanian@yahoo.com' || user?.user_metadata?.role === 'admin'

  const handleSignOut = async () => {
    await signOut()
  }

  const handlePassClick = () => {
    setOpenMegaMenu(null)
    if (allAccessPass) {
      navigate('/downloads')
      return
    }
    setAllAccess(true)
    navigate('/checkout')
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/templates?q=${encodeURIComponent(q)}` : '/templates')
    setQuery('')
    setIsOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FBFBFA]/92 backdrop-blur-md border-b border-[#EAEAEA] text-[#111111]">
      <div className="container mx-auto">
        <div className="relative z-10 flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#e85a2d] flex items-center justify-center shadow-[0_0_20px_-4px_rgba(232,90,45,0.6)]">
              <span className="text-white font-extrabold text-lg">U</span>
            </div>
            <span className="font-slab font-bold text-xl text-[#111111] tracking-tight hidden sm:block">
              Unccodestore
            </span>
          </Link>

          {/* Desktop Nav with Mega Menus */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {/* Browse Templates Mega Menu — full-viewport panel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMegaMenu(openMegaMenu === 'browse' ? null : 'browse')}
                aria-expanded={openMegaMenu === 'browse'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors ${openMegaMenu === 'browse' ? 'text-[#111111]' : 'text-[#2F3437] hover:text-[#111111]'}`}>
                {t('nav.browse')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMegaMenu === 'browse' ? 'rotate-180' : ''}`} />
              </button>
              {openMegaMenu === 'browse' && (
                <div className="fixed top-16 left-0 right-0 z-50 border-b border-[#EAEAEA] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)]">
                  <div className="max-w-[1400px] mx-auto px-8 py-6 grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest mb-3">{t('nav.categories')}</p>
                      <div className="flex flex-col gap-0.5">
                        {(categories && categories.length > 0 ? categories : ['WordPress Themes', 'eCommerce Templates', 'Site Templates', 'Marketing Templates', 'CMS Templates', 'Blogging', 'E-Commerce', 'SaaS']).slice(0, 8).map((cat) => {
                          const Icon = getCategoryIcon(cat)
                          return (
                            <Link
                              key={cat}
                              to={`/templates?category=${encodeURIComponent(cat)}`}
                              onClick={() => setOpenMegaMenu(null)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F5F4F0] transition-colors group">
                              <Icon className="w-4 h-4 text-[#787774] group-hover:text-brand-400 transition-colors" />
                              <span className="text-sm text-[#2F3437] group-hover:text-[#111111]">{cat}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest mb-3">{t('nav.featured')}</p>
                      <MegaMenuItem icon={Sparkles} title={t('nav.featuredThemes')} desc={t('nav.featuredThemesDesc')} to="/templates?featured=true" onClick={() => setOpenMegaMenu(null)} />
                      <MegaMenuItem icon={Star} title={t('nav.bestSellers')} desc={t('nav.bestSellersDesc')} to="/templates?sort=bestsellers" onClick={() => setOpenMegaMenu(null)} />
                      <MegaMenuItem icon={Layers} title={t('nav.newestItems')} desc={t('nav.newestItemsDesc')} to="/templates?sort=newest" onClick={() => setOpenMegaMenu(null)} />
                      <MegaMenuItem icon={Palette} title={t('nav.allTemplates')} desc={t('nav.allTemplatesDesc')} to="/templates" onClick={() => setOpenMegaMenu(null)} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest mb-3">{t('nav.quickLinks')}</p>
                      <MegaMenuItem icon={Download} title={t('nav.myDownloads')} desc={t('nav.myDownloadsDesc')} to="/downloads" onClick={() => setOpenMegaMenu(null)} />
                      <MegaMenuItem icon={Heart} title={t('nav.myFavorites')} desc={t('nav.myFavoritesDesc')} to="/favorites" onClick={() => setOpenMegaMenu(null)} />
                      <MegaMenuItem icon={ShoppingCart} title={t('nav.shoppingCart')} desc={t('nav.itemsInCart', { count: totalItems })} to="/cart" onClick={() => setOpenMegaMenu(null)} />
                      <div className="mt-3 ml-3 mr-3 p-4 rounded-lg bg-[#e85a2d] text-white">
                        <button
                          type="button"
                          onClick={handlePassClick}
                          className="w-full text-left group cursor-pointer">
                          <p className="text-sm font-bold font-slab flex items-center gap-1.5">
                            <Crown className="w-4 h-4" />
                            {t('nav.allAccessPass')}
                          </p>
                          <p className="text-xs text-white/80 mt-1">{t('nav.unlimitedDownloads300')}</p>
                          <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#e85a2d] transition-colors group-hover:bg-[#FFF4EF]">
                            {allAccessPass ? t('nav.viewDownloads') : t('nav.getPass')}
                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Mega Menu — centered small panel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMegaMenu(openMegaMenu === 'company' ? null : 'company')}
                aria-expanded={openMegaMenu === 'company'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors ${openMegaMenu === 'company' ? 'text-[#111111]' : 'text-[#2F3437] hover:text-[#111111]'}`}>
                {t('nav.company')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMegaMenu === 'company' ? 'rotate-180' : ''}`} />
              </button>
              {openMegaMenu === 'company' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-[340px] bg-white border border-[#EAEAEA] rounded-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] p-4">
                    <MegaMenuItem icon={Users} title={t('nav.aboutUs')} desc={t('nav.aboutUsDesc')} to="/about" onClick={() => setOpenMegaMenu(null)} />
                    <MegaMenuItem icon={Mail} title={t('nav.contactUs')} desc={t('nav.contactUsDesc')} to="/contact" onClick={() => setOpenMegaMenu(null)} />
                    <MegaMenuItem icon={HelpCircle} title={t('nav.faq')} desc={t('nav.faqDesc')} to="/faq" onClick={() => setOpenMegaMenu(null)} />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing anchor link */}
            <Link
              to="/#pricing"
              onClick={() => setOpenMegaMenu(null)}
              className="inline-flex items-center px-3 py-2 text-sm font-semibold text-[#2F3437] hover:text-[#111111] transition-colors">
              {t('nav.pricing')}
            </Link>

            {/* Help & Legal Mega Menu — centered small panel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMegaMenu(openMegaMenu === 'legal' ? null : 'legal')}
                aria-expanded={openMegaMenu === 'legal'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors ${openMegaMenu === 'legal' ? 'text-[#111111]' : 'text-[#2F3437] hover:text-[#111111]'}`}>
                {t('nav.helpLegal')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMegaMenu === 'legal' ? 'rotate-180' : ''}`} />
              </button>
              {openMegaMenu === 'legal' && (
                <div className="fixed top-16 left-0 right-0 z-50 border-b border-[#EAEAEA] bg-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)]">
                  <div className="max-w-[1400px] mx-auto px-8 py-6 grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest mb-3">{t('nav.help')}</p>
                      <div className="flex flex-col gap-0.5">
                        <MegaMenuItem icon={HelpCircle} title={t('nav.helpCenter')} desc={t('nav.helpCenterDesc')} to="/faq" onClick={() => setOpenMegaMenu(null)} />
                        <MegaMenuItem icon={Mail} title={t('nav.contactSupport')} desc={t('nav.contactSupportDesc')} to="/contact" onClick={() => setOpenMegaMenu(null)} />
                        <MegaMenuItem icon={HelpCircle} title={t('nav.faq')} desc={t('nav.faqDesc')} to="/faq" onClick={() => setOpenMegaMenu(null)} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest mb-3">{t('nav.legal')}</p>
                      <div className="flex flex-col gap-0.5">
                        <MegaMenuItem icon={FileCheck} title={t('nav.license')} desc={t('nav.licenseDesc')} to="/license" onClick={() => setOpenMegaMenu(null)} />
                        <MegaMenuItem icon={Shield} title={t('nav.refunds')} desc={t('nav.refundsDesc')} to="/refunds" onClick={() => setOpenMegaMenu(null)} />
                        <MegaMenuItem icon={Library} title={t('nav.privacyPolicy')} desc={t('nav.privacyPolicyDesc')} to="/privacy" onClick={() => setOpenMegaMenu(null)} />
                        <MegaMenuItem icon={FileBarChart} title={t('nav.termsOfService')} desc={t('nav.termsOfServiceDesc')} to="/terms" onClick={() => setOpenMegaMenu(null)} />
                        <MegaMenuItem icon={FileText} title={t('nav.cookiePolicy')} desc={t('nav.cookiePolicyDesc')} to="/cookies" onClick={() => setOpenMegaMenu(null)} />
                      </div>
                    </div>
                    <div>
                      <div className="mt-3 ml-3 mr-3 p-4 rounded-lg bg-[#e85a2d] text-white">
                        <p className="text-sm font-bold font-slab">{t('sidebar.contactSupport')}</p>
                        <p className="text-xs text-white/80 mt-1">{t('nav.contactSupportDesc')}</p>
                        <Link
                          to="/contact"
                          onClick={() => setOpenMegaMenu(null)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#e85a2d] transition-colors hover:bg-[#FFF4EF]">
                          {t('nav.contactUs')}
                          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  to="/favorites"
                  className="relative p-2.5 rounded-full hover:bg-[#F5F4F0] transition-colors"
                  aria-label={t('nav.favorites')}>
                  <Heart className="w-[18px] h-[18px] text-[#2F3437]" />
                  {favorites.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#e85a2d] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-full hover:bg-[#F5F4F0] transition-colors"
                  aria-label={t('nav.cart')}>
                  <ShoppingCart className="w-[18px] h-[18px] text-[#2F3437]" />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#e85a2d] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#F5F4F0] text-[#2F3437] hover:text-[#111111]">
                      <User className="w-[18px] h-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-[#EAEAEA] text-[#111111]">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold truncate text-[#111111]">{user.email}</p>
                      <p className="text-xs text-[#787774]">{t('nav.signedIn')}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-[#EAEAEA]" />
                    <DropdownMenuItem asChild className={userMenuItemClasses}>
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('nav.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={userMenuItemClasses}>
                      <Link to="/downloads">
                        <Download className="w-4 h-4 mr-2" />
                        {t('nav.myDownloads')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={userMenuItemClasses}>
                      <Link to="/profile">
                        <Settings className="w-4 h-4 mr-2" />
                        {t('nav.settings')}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className={userMenuItemClasses}>
                        <Link to="/admin">
                          <Shield className="w-4 h-4 mr-2" />
                          {t('nav.admin')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#EAEAEA]" />
                    <DropdownMenuItem onClick={handleSignOut} className={signOutMenuItemClasses}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-[#F5F4F0] transition-colors" aria-label={t('nav.cart')}>
                  <ShoppingCart className="w-[18px] h-[18px] text-[#2F3437]" />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#e85a2d] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <div className="w-px h-7 bg-[#EAEAEA] mx-1" />
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="font-semibold text-[#2F3437] hover:text-[#111111] hover:bg-[#F5F4F0]">
                    {t('nav.signIn')}
                  </Button>
                </Link>
              </>
            )}


          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1 shrink-0">
            <Link to="/cart" className="relative p-2" aria-label={t('nav.cart')}>
              <ShoppingCart className="w-5 h-5 text-[#2F3437]" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#e85a2d] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-[#F5F4F0] transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t('common.closeMenu') : t('common.openMenu')}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 animate-fade-up max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {/* Browse section */}
              <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest px-3 mt-3 mb-1">{t('nav.browse')}</p>
              <MobileNavLink to="/templates" onClick={() => setIsOpen(false)}>{t('nav.allTemplates')}</MobileNavLink>
              <MobileNavLink to="/templates?featured=true" onClick={() => setIsOpen(false)}>{t('nav.featuredThemes')}</MobileNavLink>
              <MobileNavLink to="/templates?sort=bestsellers" onClick={() => setIsOpen(false)}>{t('nav.bestSellers')}</MobileNavLink>
              <MobileNavLink to="/templates?sort=newest" onClick={() => setIsOpen(false)}>{t('nav.newestItems')}</MobileNavLink>
              <MobileNavLink to="/#pricing" onClick={() => setIsOpen(false)}>{t('nav.pricing')}</MobileNavLink>

              {/* All-Access Pass CTA */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  handlePassClick()
                }}
                className="mt-3 mx-3 p-4 rounded-lg bg-[#e85a2d] text-white text-left cursor-pointer">
                <p className="text-sm font-bold font-slab flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  {t('nav.allAccessPass')} — ${ALL_ACCESS_PRICE}
                </p>
                <p className="text-xs text-white/80 mt-1">{t('nav.unlimitedDownloads300')}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#e85a2d]">
                  {allAccessPass ? t('nav.viewDownloads') : t('nav.getPass')}
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </span>
              </button>

              {/* Categories in mobile */}
              <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest px-3 mt-4 mb-1">{t('nav.categories')}</p>
              {(categories && categories.length > 0 ? categories : ['WordPress Themes', 'eCommerce Templates', 'Site Templates', 'Marketing Templates', 'CMS Templates', 'Blogging']).map((cat) => (
                <MobileNavLink key={cat} to={`/templates?category=${encodeURIComponent(cat)}`} onClick={() => setIsOpen(false)}>
                  {cat}
                </MobileNavLink>
              ))}

              {/* Company */}
              <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest px-3 mt-4 mb-1">{t('nav.company')}</p>
              <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>{t('nav.aboutUs')}</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>{t('nav.contactUs')}</MobileNavLink>
              <MobileNavLink to="/faq" onClick={() => setIsOpen(false)}>{t('nav.faq')}</MobileNavLink>


              {/* Help & Legal */}
              <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest px-3 mt-4 mb-1">{t('nav.helpLegal')}</p>
              <MobileNavLink to="/license" onClick={() => setIsOpen(false)}>{t('nav.license')}</MobileNavLink>
              <MobileNavLink to="/refunds" onClick={() => setIsOpen(false)}>{t('nav.refunds')}</MobileNavLink>
              <MobileNavLink to="/privacy" onClick={() => setIsOpen(false)}>{t('nav.privacyPolicy')}</MobileNavLink>
              <MobileNavLink to="/terms" onClick={() => setIsOpen(false)}>{t('nav.termsOfService')}</MobileNavLink>
              <MobileNavLink to="/cookies" onClick={() => setIsOpen(false)}>{t('nav.cookiePolicy')}</MobileNavLink>

              {/* Account */}
              {user && (
                <>
                  <p className="text-[11px] font-bold text-[#787774]/70 uppercase tracking-widest px-3 mt-4 mb-1">{t('nav.account')}</p>
                  <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>{t('nav.dashboard')}</MobileNavLink>
                  <MobileNavLink to="/downloads" onClick={() => setIsOpen(false)}>{t('nav.myDownloads')}</MobileNavLink>
                  <MobileNavLink to="/favorites" onClick={() => setIsOpen(false)}>{t('nav.favorites')} {favorites.length > 0 && `(${favorites.length})`}</MobileNavLink>
                  <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>{t('nav.settings')}</MobileNavLink>
                </>
              )}

              <div className="h-px bg-[#EAEAEA] my-3" />

              <div className="flex flex-col gap-3 px-3">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full border-[#EAEAEA] bg-transparent text-[#111111] hover:bg-[#F5F4F0] hover:text-[#111111]">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.signOut')}
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full font-semibold bg-[#e85a2d] text-white hover:bg-[#ef7a52]">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
      </nav>

      {/* Utility Bar — search + language; scrolls away with the page */}
      <div className="mt-16 border-b border-[#EAEAEA] bg-[#FBFBFA]">
        <div className="container mx-auto relative flex items-center justify-center gap-2 h-11">
          <form onSubmit={onSearch} role="search" className="flex-1 min-w-0 sm:flex-none sm:w-[22rem]">
            <div className="flex w-full items-center rounded-lg border border-[#EAEAEA] bg-white focus-within:border-brand-400/50 transition-colors overflow-hidden">
              <Search className="w-4 h-4 text-brand-300/60 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="flex-1 h-8 px-2 bg-transparent text-sm text-[#111111] placeholder:text-[#787774]/70 focus:outline-none min-w-0"
                aria-label={t('common.search')}
              />
              <button
                type="submit"
                className="h-8 px-3 flex items-center justify-center text-brand-300 hover:text-brand-300 transition-colors shrink-0"
                aria-label={t('common.submitSearch')}>
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="shrink-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:rtl:left-0 sm:rtl:right-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  )
}

const MobileNavLink = ({
  to,
  onClick,
  children,
}: {
  to: string
  onClick: () => void
  children: React.ReactNode
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#2F3437] hover:text-[#111111] hover:bg-[#FBE4DA] hover:shadow-[inset_0_0_0_1px_rgba(232,90,45,0.15)] transition-all">
    {children}
    <ChevronRight className="w-4 h-4 text-[#787774]/60" />
  </Link>
)

export default Navbar
