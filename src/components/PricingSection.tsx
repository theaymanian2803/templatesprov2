import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { ALL_ACCESS_PRICE } from "@/hooks/useAllAccessPass";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const useCatalogPriceRange = () => {
  return useQuery({
    queryKey: ["catalog-price-range"],
    queryFn: async () => {
      const [minRes, maxRes] = await Promise.all([
        supabase.from("templates").select("price").order("price").limit(1),
        supabase.from("templates").select("price").order("price", { ascending: false }).limit(1),
      ]);
      const min = minRes.data?.[0]?.price as number | undefined;
      const max = maxRes.data?.[0]?.price as number | undefined;
      if (minRes.error || maxRes.error) throw minRes.error || maxRes.error;
      return { min, max };
    },
    staleTime: 60_000,
  });
};

const PricingSection = () => {
  const { setAllAccess } = useCart();
  const navigate = useNavigate();
  const { data: priceRange } = useCatalogPriceRange();

  const indFeatures = ["Achat à l'unité", "Licences standard et étendue", "6 mois de support", "Mises à jour à vie", "Fichiers sources inclus"];
  const aaFeatures = ["Accès à TOUS les templates", "Tous les futurs templates inclus", "Licence standard pour tous", "Support prioritaire", "Mises à jour à vie", "Fichiers sources inclus"];
  const indCtaLink = "/templates";
  const aaPrice = ALL_ACCESS_PRICE;

  const minPrice = priceRange?.min != null ? Math.floor(priceRange.min) : 29;
  const maxPrice = priceRange?.max != null ? Math.floor(priceRange.max) : 79;

  const handleBuyAllAccess = () => {
    setAllAccess(true);
    navigate("/checkout");
  };

  return (
    <section id="pricing" className="relative py-14 md:py-16 bg-[#FBFBFA] text-[#111111] overflow-hidden">
      <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-[80px]" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-[60px]" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <span className="text-sm font-semibold text-[#e85a2d] uppercase tracking-wider">Tarifs</span>
          <h2 className="font-slab text-3xl md:text-4xl font-bold text-[#111111] mt-3 mb-3">
            Tarifs simples et transparents
          </h2>
          <p className="text-base md:text-lg text-[#787774]">
            Achetez des templates individuellement ou obtenez tout avec un paiement unique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative p-6 md:p-7 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#e85a2d]/40 hover:shadow-lg transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h3 className="font-slab text-2xl font-bold text-[#111111] mb-2">Templates individuels</h3>
              <p className="text-[#787774] text-sm mb-4">Achetez seulement ce dont vous avez besoin</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-slab text-4xl font-bold text-[#111111]">${minPrice} – ${maxPrice}</span>
              </div>
              <p className="text-sm text-[#787774] mt-2">par template, selon la licence</p>
            </div>
            <ul className="space-y-3.5 mb-6">
              {indFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e85a2d]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#e85a2d]" />
                  </div>
                  <span className="text-[#111111]">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate(indCtaLink)}>
              Parcourir
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative p-6 md:p-7 rounded-2xl bg-white border-2 border-[#e85a2d]/60 shadow-[0_24px_60px_-24px_rgba(232,90,45,0.35)] scale-105 transition-all duration-300"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#e85a2d] text-white text-sm font-semibold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Meilleur rapport qualité-prix
            </div>
            <div className="text-center mb-6">
              <h3 className="font-slab text-2xl font-bold text-[#111111] mb-2">Pass Tout Accès</h3>
              <p className="text-[#787774] text-sm mb-4">Un paiement, tous les templates</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-slab text-4xl font-bold text-[#111111]">${aaPrice}</span>
              </div>
              <p className="text-sm text-[#787774] mt-2">paiement unique</p>
            </div>
            <ul className="space-y-3.5 mb-6">
              {aaFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e85a2d]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#e85a2d]" />
                  </div>
                  <span className="text-[#111111]">{f}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="w-full bg-[#e85a2d] hover:bg-[#d94523]" onClick={handleBuyAllAccess}>
              Obtenir le Pass — ${aaPrice}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
