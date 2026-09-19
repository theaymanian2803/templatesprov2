import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const colorClasses = [
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Fondatrice, PixelCraft Studio', avatar: 'SC', text: 'Ces templates nous ont fait gagner des mois de développement. La qualité du code est incroyable — propre, bien documenté et facile à personnaliser.', rating: 5 },
  { name: 'Marcus Williams', role: 'CTO, LaunchPad Inc', avatar: 'MW', text: 'Nous avons essayé des dizaines de fournisseurs de templates. Rien n\'égale la qualité de design et l\'optimisation des performances ici.', rating: 5 },
  { name: 'Aisha Patel', role: 'Designer Freelance', avatar: 'AP', text: 'Mes clients sont toujours impressionnés quand je livre. Ces templates me font passer pour un génie. Le meilleur investissement que j\'ai fait.', rating: 5 },
  { name: 'David Nguyen', role: 'Chef Produit, NovaTech', avatar: 'DN', text: 'Le Pass Tout Accès est une évidence. Chaque nouveau template est immédiatement disponible. Une valeur incroyable pour toute équipe.', rating: 5 },
];

const TestimonialsSection = () => {

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient-bg opacity-30" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Témoignages</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Aimé par plus de 50 000 créateurs
          </h2>
          <p className="text-lg text-muted-foreground">Découvrez pourquoi les professionnels nous font confiance pour leurs projets les plus importants</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-muted/40" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${colorClasses[index % 2]} flex items-center justify-center text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
