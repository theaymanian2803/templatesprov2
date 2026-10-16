import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { seoHead } from "@/lib/site";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <LegalPage pageKey="terms" />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/terms')({
  component: Terms,
  head: () => seoHead({ title: "Conditions d'utilisation", description: "Les règles d'utilisation de la plateforme Unccodestore.", path: '/terms' }),
})
