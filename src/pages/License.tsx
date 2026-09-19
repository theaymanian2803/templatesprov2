import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const License = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Contrat de licence</h1>
          <p className="text-muted-foreground mb-12">Dernière mise à jour : mars 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Licence standard</h2>
              <p className="text-muted-foreground leading-relaxed">
                La licence standard vous permet d'utiliser un template dans un <strong className="text-foreground">seul produit final</strong> pour vous-même ou un client. Le produit final ne doit pas être vendu ou distribué aux utilisateurs finaux. Vous pouvez personnaliser, modifier et construire à partir du template pour votre projet.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Utilisation dans un seul projet (personnel ou client)</li>
                <li>Modification et personnalisation libres</li>
                <li>Ne peut pas être revendu ou redistribué</li>
                <li>Ne peut pas être utilisé dans un SaaS ou un produit vendu à des utilisateurs</li>
                <li>Inclut 6 mois de support</li>
                <li>Mises à jour à vie incluses</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Licence étendue</h2>
              <p className="text-muted-foreground leading-relaxed">
                La licence étendue vous permet d'utiliser un template dans un <strong className="text-foreground">seul produit final qui est vendu ou distribué aux utilisateurs finaux</strong>. Cela inclut les applications SaaS, les thèmes vendus sur les marketplaces, et les produits avec des clients payants.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Utilisation dans un seul produit commercial</li>
                <li>Le produit final peut être vendu à des utilisateurs</li>
                <li>Modification et personnalisation libres</li>
                <li>Ne peut pas revendre les fichiers sources du template directement</li>
                <li>Inclut 12 mois de support prioritaire</li>
                <li>Mises à jour à vie incluses</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Pass Tout Accès</h2>
              <p className="text-muted-foreground leading-relaxed">
                Le Pass Tout Accès est un achat unique de 300 $ qui octroie une licence standard pour <strong className="text-foreground">chaque template</strong> de notre catalogue, y compris tous les futurs templates ajoutés à la marketplace. C'est le meilleur rapport qualité-prix pour les agences et les développeurs qui travaillent sur plusieurs projets.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Accès à tous les templates actuels</li>
                <li>Tous les futurs templates inclus sans frais supplémentaires</li>
                <li>Licence standard pour chaque template</li>
                <li>Support prioritaire</li>
                <li>Mises à jour à vie pour tous les templates</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Ce que vous ne pouvez pas faire</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Revendre, redistribuer ou sous-licencier les fichiers sources des templates</li>
                <li>Revendiquer la paternité d'un design de template</li>
                <li>Utiliser les templates pour créer des produits ou marketplaces concurrents</li>
                <li>Supprimer les mentions de copyright ou d'attribution des fichiers sources</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Des questions ?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si vous avez besoin d'éclaircissements sur les licences, contactez-nous à uncacademycode@gmail.com. Nous sommes heureux de vous aider à choisir la licence adaptée à votre projet.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default License;
