import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_KEY = "cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
        >
          <div className="glass-card rounded-2xl border border-border/50 p-5 shadow-xl bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-foreground text-sm">Nous utilisons des cookies 🍪</h4>
                  <button
                    onClick={handleDecline}
                    className="text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience de navigation et analyser le trafic du site. En cliquant sur \"Accepter\", vous consentez à notre utilisation des cookies.{" "}
                  <Link to="/cookies" className="text-primary hover:underline">
                    En savoir plus
                  </Link>
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAccept} className="flex-1">
                    Accepter
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDecline} className="flex-1">
                    Refuser
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
