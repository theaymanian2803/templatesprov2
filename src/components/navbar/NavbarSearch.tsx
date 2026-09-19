import { Search, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Template } from "@/hooks/useTemplates";

const NavbarSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("templates")
        .select("*")
        .ilike("title", `%${query}%`)
        .limit(5);
      setResults((data as Template[]) || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const goTo = (id: string) => {
    close();
    navigate(`/template/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      close();
      navigate(`/templates?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(true)}
            className="p-2.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Rechercher des templates"
          >
            <Search className="w-[18px] h-[18px] text-foreground" />
          </motion.button>
        ) : (
          <motion.form
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-muted/80 backdrop-blur-sm border border-border rounded-full px-3 h-9 overflow-hidden"
          >
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher des templates…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
            <button
              type="button"
              onClick={close}
              className="shrink-0 hover:text-foreground text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Dropdown results */}
      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-72 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-1">
                {results.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => goTo(t.id)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-muted/70 transition-colors"
                  >
                    <img
                      src={t.image_url}
                      alt={t.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0 border border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">${t.price}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleSubmit as any}
                  className="w-full px-4 py-2 text-xs font-semibold text-primary hover:bg-muted/50 transition-colors border-t border-border"
                >
                  Voir tous les résultats →
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun template trouvé</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavbarSearch;
