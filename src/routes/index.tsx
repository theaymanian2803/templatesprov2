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
import { seoHead } from '@/lib/site'

const Index = () => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <PromoBanner />
      <CategoriesSection />
      <UniqueThemesBanner />
      <FeaturedThemes />
      <WebsiteAppShowcase />
      <TemplatesSection />
      <PricingSection />
      <ReviewsSection />
      <SpaThemes />
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
