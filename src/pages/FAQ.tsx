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
import { Link } from "react-router-dom";

const faqCategories = [
  {
    id: "templates",
    icon: FileText,
    title: "Templates et produits",
    questions: [
      {
        q: "Quels formats de fichiers sont inclus avec chaque template ?",
        a: "Chaque template inclut des fichiers source aux formats HTML, CSS, JavaScript et React/TypeScript. Vous recevrez également les fichiers de conception PSD/Figma, la documentation et tous les actifs nécessaires comme les polices et les images.",
      },
      {
        q: "Les templates sont-ils responsifs et adaptés aux mobiles ?",
        a: "Oui ! Tous nos templates sont entièrement responsifs et testés sur plusieurs appareils et tailles d'écran. Ils fonctionnent parfaitement sur les ordinateurs de bureau, les tablettes et les appareils mobiles.",
      },
      {
        q: "Puis-je personnaliser les templates pour les adapter à ma marque ?",
        a: "Absolument ! Nos templates sont conçus pour être personnalisés. Vous pouvez facilement modifier les couleurs, les polices, les images et le contenu. La plupart des templates utilisent des variables CSS ou Tailwind CSS pour un changement rapide de thème.",
      },
      {
        q: "Les templates incluent-ils une documentation ?",
        a: "Oui, chaque template est livré avec une documentation complète couvrant l'installation, la personnalisation et le déploiement. Nous fournissons également des tutoriels vidéo pour les templates les plus populaires.",
      },
      {
        q: "Les images et les polices sont-elles incluses dans les templates ?",
        a: "Les images de démonstration sont fournies à titre d'aperçu uniquement. Cependant, nous fournissons des liens vers des ressources d'images gratuites. Les polices utilisées sont généralement des Google Fonts ou d'autres polices gratuites incluses.",
      },
    ],
  },
  {
    id: "licensing",
    icon: Shield,
    title: "Licences et utilisation",
    questions: [
      {
        q: "Quelle est la différence entre les licences standard et étendue ?",
        a: "Une licence standard vous permet d'utiliser le template pour un seul produit final (site web/application) pour vous-même ou un client. Une licence étendue permet des produits finaux illimités et peut être utilisée pour des articles vendus à plusieurs utilisateurs.",
      },
      {
        q: "Puis-je utiliser un template pour plusieurs projets ?",
        a: "Avec une licence standard, vous ne pouvez utiliser le template que pour un seul projet. Si vous devez l'utiliser pour plusieurs projets, vous devrez acheter des licences supplémentaires ou passer à une licence étendue.",
      },
      {
        q: "Puis-je revendre ou redistribuer le template ?",
        a: "Non, vous ne pouvez pas revendre ou redistribuer les fichiers du template eux-mêmes. Cependant, vous pouvez les utiliser pour créer des produits finaux pour vos clients. La licence étendue offre plus de flexibilité commerciale.",
      },
      {
        q: "Dois-je créditer Unccodestore lors de l'utilisation d'un template ?",
        a: "Non, l'attribution n'est pas requise pour les licences standard ou étendue. Cependant, nous apprécions toujours un lien vers notre site !",
      },
      {
        q: "Puis-je utiliser les templates pour des projets clients ?",
        a: "Oui ! Vous pouvez utiliser nos templates pour des projets clients. Chaque licence couvre un seul produit final, donc si vous créez des sites web pour plusieurs clients, vous aurez besoin d'une licence pour chaque projet.",
      },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Paiements et remboursements",
    questions: [
      {
        q: "Quels modes de paiement acceptez-vous ?",
        a: "Nous acceptons toutes les principales cartes de crédit (Visa, MasterCard, American Express), PayPal et Apple Pay. Toutes les transactions sont traitées de manière sécurisée via nos partenaires de paiement.",
      },
      {
        q: "Mes informations de paiement sont-elles sécurisées ?",
        a: "Oui, nous utilisons un chiffrement SSL conforme aux standards de l'industrie et ne stockons jamais vos coordonnées bancaires complètes. Tous les paiements sont traités par des processeurs de paiement conformes à la norme PCI.",
      },
      {
        q: "Offrez-vous des remboursements ?",
        a: "Oui, nous offrons une garantie de remboursement de 30 jours. Si vous n'êtes pas satisfait de votre achat, contactez notre équipe de support pour un remboursement intégral. Notez que les remboursements peuvent ne pas s'appliquer si vous avez déjà utilisé le template.",
      },
      {
        q: "Y a-t-il des frais cachés ou des abonnements ?",
        a: "Aucun frais caché ! Vous payez une fois et possédez le template pour toujours. Il n'y a pas de frais récurrents, sauf si vous optez pour notre extension de support optionnelle.",
      },
      {
        q: "Offrez-vous des réductions pour les achats en gros ?",
        a: "Oui ! Nous offrons des réductions sur volume pour les agences et les entreprises qui achètent plusieurs templates. Contactez notre équipe commerciale pour des devis personnalisés.",
      },
    ],
  },
  {
    id: "support",
    icon: Headphones,
    title: "Support et mises à jour",
    questions: [
      {
        q: "Combien de temps le support est-il inclus avec mon achat ?",
        a: "Chaque achat inclut 6 mois de support technique de la part de l'auteur du template. Vous pouvez prolonger le support pour 12 mois supplémentaires à un tarif réduit lors du paiement.",
      },
      {
        q: "Que couvre le support ?",
        a: "Le support couvre les questions sur les fonctionnalités du template, les corrections de bugs et les conseils de personnalisation de base. Il n'inclut pas le développement personnalisé, les services d'installation ou le support de plugins tiers.",
      },
      {
        q: "Comment obtenir de l'aide en cas de problème ?",
        a: "Vous pouvez nous contacter via notre système de tickets de support, le chat en direct ou par e-mail. La plupart des demandes reçoivent une réponse sous 24 heures pendant les jours ouvrés.",
      },
      {
        q: "Est-ce que je reçois des mises à jour gratuites ?",
        a: "Oui ! Vous recevez des mises à jour gratuites à vie pour tout template que vous achetez. Les mises à jour incluent les corrections de bugs, les correctifs de sécurité et les nouvelles fonctionnalités lorsqu'elles sont disponibles.",
      },
      {
        q: "Puis-je demander des fonctionnalités ou modifications personnalisées ?",
        a: "Bien que le support ne couvre pas le développement personnalisé, plusieurs de nos auteurs proposent des services de développement sur mesure. Vous pouvez les contacter directement ou utiliser notre fonctionnalité de demande de projet personnalisé.",
      },
    ],
  },
];

const FAQ = () => {
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
              Centre d'aide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Foire aux{" "}
              <span className="text-orange-500">
                Questions
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-[1.7]">
              Trouvez les réponses aux questions courantes sur nos templates, licences, paiements et support.
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
          {faqCategories.map((category, categoryIndex) => (
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
              Encore des questions ?
            </h2>
            <p className="text-gray-500 mb-6 leading-[1.7]">
              Vous ne trouvez pas ce que vous cherchez ? Notre équipe de support est là pour vous aider.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2 bg-orange-500 text-white hover:bg-orange-600 font-semibold">
                  <MessageCircle className="w-5 h-5" />
                  Contacter le support
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:border-orange-300">
                Chat en direct
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default FAQ;