import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Politique de confidentialité</h1>
          <p className="text-muted-foreground mb-12">Dernière mise à jour : mars 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">1. Informations que nous collectons</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lorsque vous créez un compte ou effectuez un achat sur TemplatePro, nous collectons votre nom, votre adresse e-mail et vos informations de paiement. Nous collectons également des données d'utilisation telles que les pages visitées, les templates consultés et les recherches effectuées pour améliorer votre expérience.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">2. Comment nous utilisons vos informations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons vos informations pour traiter les transactions, livrer les templates achetés, envoyer des confirmations de commande, fournir un support client et améliorer notre marketplace. Nous pouvons également vous envoyer des mises à jour concernant les nouveaux templates et fonctionnalités si vous avez accepté de recevoir notre newsletter.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">3. Sécurité des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité conformes aux standards de l'industrie, notamment le chiffrement SSL, le traitement sécurisé des paiements via PayPal et le stockage chiffré des données. Vos informations de paiement ne sont jamais stockées sur nos serveurs — elles sont traitées directement par notre processeur de paiement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">4. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies essentiels pour maintenir votre session et mémoriser vos préférences (comme le mode sombre). Nous utilisons également des cookies d'analyse pour comprendre comment les visiteurs interagissent avec notre site. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais cela pourrait affecter certaines fonctionnalités.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">5. Services tiers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des services tiers pour le traitement des paiements (PayPal), l'hébergement et les analyses. Ces services ont leurs propres politiques de confidentialité et nous vous encourageons à les consulter. Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins marketing.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">6. Vos droits</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles à tout moment via les paramètres de votre profil. Vous pouvez également demander une exportation complète de vos données ou la suppression de votre compte en nous contactant à uncacademycode@gmail.com.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">7. Nous contacter</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à uncacademycode@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Privacy;
