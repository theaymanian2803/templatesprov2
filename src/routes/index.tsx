import { useMemo, type ComponentType } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import CategoriesSection from '@/components/CategoriesSection'
import FeaturedThemes from '@/components/FeaturedThemes'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import Navbar from '@/components/Navbar'
import PricingSection from '@/components/PricingSection'
import PromoBanner from '@/components/PromoBanner'
import ReviewsSection from '@/components/ReviewsSection'
import SpaThemes from '@/components/SpaThemes'
import TemplatesSection from '@/components/TemplatesSection'
import UniqueThemesBanner from '@/components/UniqueThemesBanner'
import WebsiteAppShowcase from '@/components/WebsiteAppShowcase'
import CustomBanner from '@/components/landing/CustomBanner'
import LogosStrip from '@/components/landing/LogosStrip'
import { useLandingSections, type LandingSection } from '@/hooks/useLandingSections'
import { LANDING_SECTION_KEYS } from '@/lib/landingSections'
import { seoHead } from '@/lib/site'

/**
 * Built-in landing sections (excluding the hero, which accepts overrides).
 * The admin can reorder/hide these and add custom sections; this map keeps the
 * default order as a fallback while the sections query loads, so the homepage
 * never renders blank.
 */
const BUILT_IN: Record<string, ComponentType> = {
  promo: PromoBanner,
  categories: CategoriesSection,
  unique: UniqueThemesBanner,
  featured: FeaturedThemes,
  showcase: WebsiteAppShowcase,
  templates: TemplatesSection,
  pricing: PricingSection,
  reviews: ReviewsSection,
  spa: SpaThemes,
}

const renderSection = (section: LandingSection) => {
  const key = section.section_key
  if (key === 'hero') return <HeroSection key={section.id} overrides={section.config} />

  const BuiltIn = BUILT_IN[key]
  if (BuiltIn) return <BuiltIn key={section.id} />

  const type = section.config?.type as string | undefined
  if (type === 'custom_banner') return <CustomBanner key={section.id} section={section} />
  if (type === 'logos') return <LogosStrip key={section.id} section={section} />
  return null
}

const Index = () => {
  const { data: sections } = useLandingSections()

  const body = useMemo(() => {
    const visible = (sections ?? [])
      .filter((section) => section.visible)
      .sort((a, b) => a.sort_order - b.sort_order)

    if (visible.length > 0) return visible.map(renderSection)

    // Fallback: default order until the sections have loaded.
    return LANDING_SECTION_KEYS.map((key) =>
      key === 'hero' ? <HeroSection key={key} /> : (() => {
        const BuiltIn = BUILT_IN[key]
        return BuiltIn ? <BuiltIn key={key} /> : null
      })(),
    )
  }, [sections])

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {body}
      <Footer />
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: Index,
  head: () =>
    seoHead({
      title: 'Unccodestore — Templates Web Premium & Code Source',
      description:
        'Plateforme de templates web premium, de code source et de kits UI prêts pour la production. Achetez des assets professionnels pour développeurs et designers.',
      path: '/',
    }),
})
