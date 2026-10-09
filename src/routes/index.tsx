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

export const Route = createFileRoute('/')({ component: Index })
