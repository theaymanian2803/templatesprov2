import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { seoHead } from "@/lib/site";

const License = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <LegalPage pageKey="license" />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/license')({
  component: License,
  head: () => seoHead({ title: 'Contrat de licence', description: 'Les termes de licence des templates Unccodestore.', path: '/license' }),
})
