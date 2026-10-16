import { createFileRoute } from '@tanstack/react-router'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { seoHead } from "@/lib/site";

const Cookies = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <LegalPage pageKey="cookies" />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/cookies')({
  component: Cookies,
  head: () => seoHead({ title: 'Politique des cookies', description: 'Comment Unccodestore utilise les cookies.', path: '/cookies' }),
})
