import { useState, useCallback, forwardRef, type ComponentPropsWithoutRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "212694784176";

const WhatsAppIcon = forwardRef<SVGSVGElement, ComponentPropsWithoutRef<"svg">>(
  ({ className = "", ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-6 h-6 ${className}`}
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
);

WhatsAppIcon.displayName = "WhatsAppIcon";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState("Bonjour ! J'ai une question à propos de TemplatePro.");

  const getWhatsAppUrl = useCallback(() => {
    const message = (whatsappMsg.trim() || "Bonjour ! J'ai une question à propos de TemplatePro.").slice(0, 1000);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [whatsappMsg]);

  const handleOpenWhatsAppChat = () => {
    const url = getWhatsAppUrl();
    const isEmbedded = window.self !== window.top;

    if (isEmbedded) {
      window.open(url, "_top");
      return;
    }

    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.assign(url);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setWhatsappMsg("Bonjour ! J'ai une question à propos de TemplatePro."), 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-5 py-4 flex items-center gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-primary-foreground text-sm">
                  WhatsApp
                </h3>
                <p className="text-primary-foreground/70 text-xs">
                  Envoyez-nous un message pour une aide personnalisée
                </p>
              </div>
              <button onClick={handleClose} className="text-primary-foreground/80 hover:text-primary-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp View */}
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-600">
                    <WhatsAppIcon />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Support TemplatePro</p>
                    <p className="text-xs text-muted-foreground">+{WHATSAPP_NUMBER}</p>
                    <p className="text-xs text-green-600 mt-0.5">● Online</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Votre message</label>
                  <textarea
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    className="w-full min-h-[120px] p-3 rounded-xl border border-border/50 bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Tapez votre message ici..."
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border/50">
                <Button
                  type="button"
                  onClick={handleOpenWhatsAppChat}
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white gap-2"
                  aria-label="Open WhatsApp chat"
                >
                  <WhatsAppIcon />
                  Ouvrir le chat WhatsApp
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatBubble;
