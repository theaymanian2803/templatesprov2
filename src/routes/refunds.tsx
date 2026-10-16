import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { seoHead } from "@/lib/site";

const Refunds = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <LegalPage pageKey="refunds" />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/refunds')({
  component: Refunds,
  head: () => seoHead({ title: 'Politique de remboursement', description: 'Notre politique de remboursement des templates.', path: '/refunds' }),
})
