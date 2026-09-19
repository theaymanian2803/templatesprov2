import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { setLanguage, type Lang } from '@/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
]

const currentLang = (lang: string): Lang => (['ar', 'en'].includes(lang) ? (lang as Lang) : 'fr')

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const current = currentLang(i18n.language)
  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Language / Langue / اللغة"
          className="group inline-flex items-center gap-1 rounded-lg border border-[#EAEAEA] bg-white px-2.5 py-2 text-xs font-bold text-[#2F3437] transition-colors hover:border-[#e85a2d] hover:bg-[#e85a2d] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e85a2d]/40 data-[state=open]:border-[#e85a2d] data-[state=open]:bg-[#e85a2d] data-[state=open]:text-white">
          <Globe className="w-3.5 h-3.5 text-[#787774] transition-colors group-hover:text-white group-data-[state=open]:text-white" />
          <span>{active.short}</span>
          <ChevronDown className="w-3 h-3 text-[#787774] transition-colors group-hover:text-white group-data-[state=open]:text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] bg-white border border-[#EAEAEA] text-[#111111]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => setLanguage(lang.code)}
            className="group flex items-center justify-between gap-2 text-sm font-medium cursor-pointer focus:bg-[#e85a2d] focus:text-white">
            <span className="flex items-center gap-2">
              <span className="w-7 text-[10px] font-bold text-[#787774] group-focus:text-white/80">
                {lang.short}
              </span>
              <span>{lang.label}</span>
            </span>
            {current === lang.code && (
              <Check className="w-4 h-4 text-[#e85a2d] group-focus:text-white" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher