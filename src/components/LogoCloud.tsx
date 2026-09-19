import { motion } from "framer-motion";

const brands = [
  "Google", "Microsoft", "Spotify", "Airbnb", "Stripe", "Shopify", "Figma", "Notion"
];

const LogoCloud = () => {
  return (
    <section className="py-12 border-y border-border/50 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground font-medium uppercase tracking-wider mb-8"
        >
          Approuvé par des équipes de grandes entreprises
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="text-xl font-display font-bold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-default select-none"
            >
              {brand}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCloud;
