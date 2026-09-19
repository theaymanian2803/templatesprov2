import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useDashboardStats, usePurchasedTemplates } from "@/hooks/useDashboard";
import { useMyOrders } from "@/hooks/useOrders";
import { useTemplates } from "@/hooks/useTemplates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Download,
  Star,
  Heart,
  Package,
  DollarSign,
  ArrowRight,
  Clock,
  MessageSquare,
  Rocket,
} from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import ReviewReminderBanner from "@/components/dashboard/ReviewReminderBanner";
import HostingWizard from "@/components/HostingWizard";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: purchased, isLoading: purchasedLoading } = usePurchasedTemplates();
  const { data: recentOrders } = useMyOrders();
  const { favorites } = useFavorites();
  const { data: recommendedTemplates } = useTemplates({ featured: true, limit: 4 });
  const [hostingOpen, setHostingOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16 container mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const statCards = [
    { label: "Commandes", value: stats?.totalOrders ?? 0, icon: Package, color: "text-primary" },
    { label: "Dépensé", value: `$${(stats?.totalSpent ?? 0).toFixed(0)}`, icon: DollarSign, color: "text-primary" },
    { label: "Templates", value: stats?.totalDownloads ?? 0, icon: Download, color: "text-primary" },
    { label: "Avis en attente", value: stats?.pendingReviews ?? 0, icon: Star, color: "text-accent" },
  ];

  const unreviewed = (purchased || []).filter((t) => !t.has_review);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Bon retour{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""} !
            </h1>
            <p className="text-muted-foreground mt-1">Aperçu de votre compte</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {statsLoading ? <Skeleton className="h-7 w-10" /> : stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review Reminders */}
          {unreviewed.length > 0 && (
            <ReviewReminderBanner templates={unreviewed} />
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Recent Orders */}
            <Card className="md:col-span-2 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Orders
                    Commandes récentes
                  </CardTitle>
                  <CardDescription>Vos derniers achats</CardDescription>
                </div>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Tout voir <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!recentOrders?.length ? (
                  <p className="text-sm text-muted-foreground py-4">Aucune commande pour le moment. Parcourez nos templates !</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-foreground">${Number(order.total_amount).toFixed(2)}</span>
                          <Badge
                            variant={
                              order.status === "completed" ? "default" :
                              order.status === "pending" ? "secondary" :
                              "outline"
                            }
                            className="capitalize text-xs"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/downloads" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" /> Mes téléchargements
                  </Button>
                </Link>
                <Link to="/favorites" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Heart className="w-4 h-4" /> Favoris
                    {favorites.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">{favorites.length}</Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/templates" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ShoppingCart className="w-4 h-4" /> Parcourir
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" /> Paramètres
                  </Button>
                </Link>
                <Button
                  variant="hero"
                  className="w-full justify-start gap-2"
                  onClick={() => setHostingOpen(true)}
                >
                  <Rocket className="w-4 h-4" /> Héberger
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Templates */}
          {recommendedTemplates && recommendedTemplates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-foreground">Recommandations</h2>
                <Link to="/templates">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Tout voir <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedTemplates.slice(0, 4).map((t) => (
                  <TemplateCard
                    key={t.id}
                    id={t.id}
                    image={t.image_url}
                    title={t.title}
                    category={t.category}
                    price={Number(t.price)}
                    rating={t.rating ?? 0}
                    sales={t.sales ?? 0}
                    reviewCount={t.review_count}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <HostingWizard open={hostingOpen} onOpenChange={setHostingOpen} />
    </main>
  );
};

export default Dashboard;
