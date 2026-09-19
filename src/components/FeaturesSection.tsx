import { 
  Zap, Shield, Palette, Code2, HeadphonesIcon, RefreshCw, LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, LucideIcon> = {
  "Lightning Fast": Zap,
  "Secure & Reliable": Shield,
  "Fully Customizable": Palette,
  "Clean Code": Code2,
  "Premium Support": HeadphonesIcon,
  "Regular Updates": RefreshCw,
};

const fallbackIcons = [Zap, Shield, Palette, Code2, HeadphonesIcon, RefreshCw];

const featuresData = [
  { title: 'Rapide comme l\'éclair', description: 'Optimisé pour la performance avec chargement différé, code splitting et livraison CDN.' },
  { title: 'Sécurisé et fiable', description: 'Construit avec les meilleures pratiques de sécurité et des mises à jour régulières pour vous protéger.' },
  { title: 'Entièrement personnalisable', description: 'Options de personnalisation faciles à utiliser avec une documentation détaillée incluse.' },
  { title: 'Code propre', description: 'Code bien structuré et commenté suivant les meilleures pratiques de l\'industrie.' },
  { title: 'Support premium', description: 'Obtenez de l\'aide de notre équipe d\'experts avec un support prioritaire 24h/24.' },
  { title: 'Mises à jour régulières', description: 'Améliorations continues et nouvelles fonctionnalités ajoutées régulièrement.' },
]

const FeaturesSection = () => {
  const features = featuresData.map((f, i) => ({
    ...f,
    icon: iconMap[f.title] || fallbackIcons[i % fallbackIcons.length],
  }));

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient-bg opacity-50" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Pourquoi nous choisir
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Conçu pour la réussite
          </h2>
          <p className="text-lg text-muted-foreground">
            Chaque template est conçu avec des fonctionnalités pour vous aider à réussir en ligne
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.08 }}
              className="group p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-glow-primary transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
