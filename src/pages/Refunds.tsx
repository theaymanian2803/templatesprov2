import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Refunds = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Politique de remboursement</h1>
          <p className="text-muted-foreground mb-12">Dernière mise à jour : mars 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Notre engagement</h2>
              <p className="text-muted-foreground leading-relaxed">
                Chez TemplatePro, nous garantissons la qualité de nos templates. Nous voulons que chaque client soit entièrement satisfait de son achat. Si quelque chose ne va pas, nous ferons tout pour y remédier.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Conditions d'éligibilité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez demander un remboursement dans les <strong className="text-foreground">14 jours</strong> suivant votre achat si :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Le template présente un défaut ou un bug important que nous ne pouvons pas résoudre</li>
                <li>Le template ne correspond pas à sa description ou à son aperçu</li>
                <li>Vous avez été facturé incorrectement (paiements en double, mauvais montant)</li>
                <li>Vous avez accidentellement acheté le même template deux fois</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Cas non remboursables</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les remboursements ne peuvent pas être accordés dans les situations suivantes :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                <li>Vous avez changé d'avis après avoir téléchargé les fichiers du template</li>
                <li>Vous ne possédez pas les compétences techniques nécessaires pour utiliser ou personnaliser le template</li>
                <li>Le template fonctionne comme décrit mais ne correspond pas à vos attentes subjectives</li>
                <li>Plus de 14 jours se sont écoulés depuis l'achat</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Comment demander un remboursement</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour demander un remboursement, envoyez-nous un e-mail à <strong className="text-foreground">uncacademycode@gmail.com</strong> avec votre numéro de commande et une description du problème. Notre équipe examinera votre demande et répondra sous 2 jours ouvrés. Les remboursements approuvés sont traités sur votre moyen de paiement original sous 5 à 10 jours ouvrés.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Remboursement du Pass Tout Accès</h2>
              <p className="text-muted-foreground leading-relaxed">
                Les achats du Pass Tout Accès sont remboursables dans les 14 jours si vous n'avez pas téléchargé plus de 3 templates. Une fois que vous avez téléchargé plus de 3 templates, le pass est considéré comme pleinement utilisé et non remboursable.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Besoin d'aide ?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Avant de demander un remboursement, nous vous encourageons à <Link to="/contact" className="text-primary hover:underline">contacter notre équipe de support</Link>. De nombreux problèmes peuvent être résolus rapidement avec notre aide — nous sommes là pour vous assister.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Refunds;
