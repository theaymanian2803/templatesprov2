import { motion } from "framer-motion";
import { Zap, Globe, Shield, Rocket } from "lucide-react";

const metrics = [
  { icon: Zap, value: "99.9%", label: "Garantie de disponibilité", color: "text-primary" },
  { icon: Globe, value: "190+", label: "Pays desservis", color: "text-accent" },
  { icon: Shield, value: "256-bit", label: "Chiffrement SSL", color: "text-primary" },
  { icon: Rocket, value: "<1s", label: "Temps de chargement", color: "text-accent" },
];

const ShowcaseBanner = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-[0.03]" />
      
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {metrics.map((m, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm group hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-3 ${m.color} group-hover:scale-110 transition-transform`}>
                <m.icon className="w-6 h-6" />
              </div>
              <div className="font-display text-3xl font-bold text-foreground mb-1">{m.value}</div>
              <div className="text-sm text-muted-foreground">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ShowcaseBanner;
