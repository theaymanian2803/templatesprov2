import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Conditions d'utilisation</h1>
          <p className="text-muted-foreground mb-12">Dernière mise à jour : mars 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                En accédant et en utilisant TemplatePro, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas une partie de ces conditions, vous ne pouvez pas utiliser nos services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">2. Création de compte</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour acheter des templates, vous devez créer un compte avec une adresse e-mail valide. Vous êtes responsable de la confidentialité de vos identifiants de compte et de toutes les activités effectuées sous votre compte.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">3. Achats et licences</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tous les achats de templates sont soumis à nos conditions de licence. Une licence standard permet l'utilisation dans un seul produit final. Une licence étendue permet l'utilisation dans des produits vendus aux utilisateurs finaux. Le Pass Tout Accès octroie une licence standard pour chaque template de notre catalogue, y compris les ajouts futurs.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">4. Propriété intellectuelle</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tous les templates, designs, codes et contenus sur TemplatePro sont la propriété de TemplatePro ou de ses concédants de licence. L'achat d'un template vous accorde une licence d'utilisation — et non la propriété de la propriété intellectuelle. Vous ne pouvez pas revendre, redistribuer ou sous-licencier les fichiers sources des templates.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">5. Utilisations interdites</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous ne pouvez pas utiliser nos templates à des fins illégales, revendre les fichiers de template tels quels, revendiquer la paternité d'un design de template, ou utiliser les templates d'une manière qui concurrence TemplatePro. La violation de ces conditions peut entraîner la révocation de la licence sans remboursement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">6. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront communiquées par e-mail ou par un avis visible sur notre site web. L'utilisation continue après les modifications constitue l'acceptation des conditions mises à jour.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">7. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces conditions, contactez-nous à uncacademycode@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Terms;
