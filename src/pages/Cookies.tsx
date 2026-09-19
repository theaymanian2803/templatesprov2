import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Politique des cookies</h1>
          <p className="text-muted-foreground mb-12">Dernière mise à jour : mars 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Que sont les cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils nous aident à mémoriser vos préférences, à vous maintenir connecté et à comprendre comment vous utilisez notre site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Cookies essentiels</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ces cookies sont nécessaires au bon fonctionnement de TemplatePro. Ils gèrent les sessions d'authentification, les données du panier et les jetons de sécurité. Sans ces cookies, le site ne peut pas fonctionner correctement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Cookies de préférences</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies de préférences pour mémoriser vos paramètres, tels que votre thème choisi (mode clair ou sombre) et vos préférences d'affichage. Ces cookies améliorent votre expérience de navigation mais ne sont pas strictement nécessaires.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Cookies d'analyse</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies d'analyse pour comprendre comment les visiteurs interagissent avec notre marketplace — quelles pages sont les plus visitées, quels templates sont populaires et comment les utilisateurs naviguent sur le site. Ces données sont anonymisées et utilisées uniquement pour améliorer nos services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Gestion des cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur. La plupart des navigateurs vous permettent de refuser les cookies ou de les supprimer. Veuillez noter que la désactivation des cookies essentiels peut vous empêcher d'utiliser certaines fonctionnalités comme l'ajout d'articles au panier ou la connexion.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si vous avez des questions sur notre utilisation des cookies, veuillez nous contacter à uncacademycode@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Cookies;
