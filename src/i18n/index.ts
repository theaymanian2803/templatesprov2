import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import fr from './locales/fr'
import ar from './locales/ar'
import enTemplates from './locales/en.templates'
import frTemplates from './locales/fr.templates'
import arTemplates from './locales/ar.templates'
import enPreview from './locales/en.preview'
import frPreview from './locales/fr.preview'
import arPreview from './locales/ar.preview'
import enCheckout from './locales/en.checkout'
import frCheckout from './locales/fr.checkout'
import arCheckout from './locales/ar.checkout'

export type Lang = 'fr' | 'ar' | 'en'

const LANGS: Lang[] = ['fr', 'ar', 'en']

const isLang = (value: string | null): value is Lang => !!value && LANGS.includes(value as Lang)

export const getInitialLang = (): Lang => {
  if (typeof window === 'undefined') return 'fr'
  const urlLang = new URLSearchParams(window.location.search).get('lang')
  if (isLang(urlLang)) return urlLang
  const stored = localStorage.getItem('lang')
  if (isLang(stored)) return stored
  return 'fr'
}

export const applyLang = (lang: Lang) => {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

export const setLanguage = (lang: Lang) => {
  localStorage.setItem('lang', lang)
  applyLang(lang)
  i18n.changeLanguage(lang)
}

const initialLang = getInitialLang()

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, ...enTemplates, ...enPreview, ...enCheckout } },
    fr: { translation: { ...fr, ...frTemplates, ...frPreview, ...frCheckout } },
    ar: { translation: { ...ar, ...arTemplates, ...arPreview, ...arCheckout } },
  },
  lng: initialLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

if (typeof window !== 'undefined') {
  applyLang(initialLang)
}

export default i18n