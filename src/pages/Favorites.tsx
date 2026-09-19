import { useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TemplateCard from "@/components/TemplateCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTemplates } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Search, ArrowUpDown, Filter, Loader2 } from "lucide-react";

type SortOption = "newest" | "price-low" | "price-high" | "rating" | "popular";

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { data: allTemplates, isLoading: templatesLoading } = useTemplates();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get favorite templates
  const favoriteTemplates = useMemo(() => {
    if (!allTemplates) return [];
    return allTemplates.filter((t) => favorites.includes(t.id));
  }, [favorites, allTemplates]);

  // Get unique categories from favorites
  const categories = useMemo(() => {
    const cats = new Set(favoriteTemplates.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, [favoriteTemplates]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...favoriteTemplates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "rating":
        result.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case "popular":
        result.sort((a, b) => b.sales - a.sales);
        break;
      default:
        // newest - keep original order
        break;
    }

    return result;
  }, [favoriteTemplates, searchQuery, sortBy, categoryFilter]);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = authLoading || favoritesLoading || templatesLoading;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-9 pb-16">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Mes favoris
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Votre collection de templates sauvegardés. Parcourez, filtrez et trouvez votre match parfait.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="glass-card max-w-md mx-auto p-8 rounded-2xl border border-border/50">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  Aucun favori
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explorez les templates et ajoutez vos favoris pour les retrouver ici.
                </p>
                <Link to="/">
                  <Button variant="hero">Parcourir</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Filters Bar */}
              <div className="glass-card p-4 rounded-2xl border border-border/50 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans mes favoris..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-muted-foreground hidden md:block" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat === "all" ? "Toutes les catégories" : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <ArrowUpDown className="w-5 h-5 text-muted-foreground hidden md:block" />
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Trier par" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Plus récents</SelectItem>
                        <SelectItem value="popular">Les plus populaires</SelectItem>
                        <SelectItem value="rating">Les mieux notés</SelectItem>
                        <SelectItem value="price-low">Prix croissant</SelectItem>
                        <SelectItem value="price-high">Prix décroissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Affichage de <span className="font-semibold text-foreground">{filteredTemplates.length}</span> sur{" "}
                  <span className="font-semibold text-foreground">{favorites.length}</span> favoris
                </p>
              </div>

              {/* Templates Grid */}
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Aucun template ne correspond à votre recherche. Essayez de modifier vos filtres.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard 
                      key={template.id} 
                      id={template.id}
                      image={template.image_url}
                      title={template.title}
                      category={template.category}
                      price={Number(template.price)}
                      rating={Number(template.rating)}
                      sales={template.sales}
                      reviewCount={template.review_count}
                      youtubeId={template.youtube_id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Favorites;
