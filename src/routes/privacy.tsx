import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { seoHead } from "@/lib/site";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <LegalPage pageKey="privacy" />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/privacy')({
  component: Privacy,
  head: () => seoHead({ title: 'Politique de confidentialité', description: 'Comment Unccodestore collecte et protège vos données.', path: '/privacy' }),
})
