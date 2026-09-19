import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface FavoritesContextType {
  favorites: string[];
  loading: boolean;
  toggleFavorite: (templateId: string) => Promise<void>;
  isFavorite: (templateId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("template_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setFavorites(data.map((f) => f.template_id));
    }
    setLoading(false);
  };

  const toggleFavorite = async (templateId: string) => {
    if (!user) return;

    const isFav = favorites.includes(templateId);

    if (isFav) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("template_id", templateId);

      if (!error) {
        setFavorites((prev) => prev.filter((id) => id !== templateId));
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, template_id: templateId });

      if (!error) {
        setFavorites((prev) => [...prev, templateId]);
      }
    }
  };

  const isFavorite = (templateId: string) => favorites.includes(templateId);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
