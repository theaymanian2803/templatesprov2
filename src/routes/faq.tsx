import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, FileText, Shield, CreditCard, Headphones } from "lucide-react";
import { Link } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { seoHead } from "@/lib/site";

const categoryIds = ["templates", "licensing", "payments", "support"];
const categoryIcons = [FileText, Shield, CreditCard, Headphones];

type FaqCategory = { title: string; questions: { q: string; a: string }[] }

const FAQ = () => {
  const { t } = useTranslation();
  const rawCategories = t('faq.categories', { returnObjects: true }) as unknown as FaqCategory[];
  const faqCategories = rawCategories.map((c, i) => ({
    ...c,
    id: categoryIds[i % categoryIds.length],
    icon: categoryIcons[i % categoryIcons.length],
  }));

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-5 pb-16 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-500 font-medium text-sm mb-6">
              <HelpCircle className="w-4 h-4" />
              {t('faq.badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
              {t('faq.titleLead')}{" "}
              <span className="text-orange-500">
                {t('faq.titleHighlight')}
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-[1.7]">
              {t('faq.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 border-y border-gray-200 sticky top-16 bg-white/80 backdrop-blur-md z-40">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-orange-500 transition-colors"
              >
                <category.icon className="w-4 h-4" />
                <span className="font-medium text-sm text-gray-700">{category.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
          {faqCategories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="mb-16 last:mb-0 scroll-mt-40"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {category.title}
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.id}-${index}`}
                    className="bg-white border border-gray-200 rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-orange-500 py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-500 pb-4 leading-[1.7]">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-xl border border-gray-200 text-center max-w-3xl mx-auto">
            <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
              {t('faq.ctaHeading')}
            </h2>
            <p className="text-gray-500 mb-6 leading-[1.7]">
              {t('faq.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2 bg-orange-500 text-white hover:bg-orange-600 font-semibold">
                  <MessageCircle className="w-5 h-5" />
                  {t('faq.ctaSupport')}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:border-orange-300">
                {t('faq.ctaLiveChat')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/faq')({
  component: FAQ,
  head: () =>
    seoHead({
      title: 'FAQ',
      description: 'Réponses aux questions fréquentes sur les templates, licences, paiements et support.',
      path: '/faq',
    }),
})
