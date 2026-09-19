import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  Crown,
  Check,
} from "lucide-react";

declare global {
  interface Window {
    paypal?: any;
  }
}

const proService = {
  enabled: true,
  price: 0,
  title: 'Engager un Pro',
  description: 'Vous ne voulez pas gérer l\'hébergement ? Laissez nos experts déployer votre template pour vous.',
  features: ['Configuration de déploiement professionnelle', 'Configuration de domaine incluse', 'Configuration du certificat SSL', 'Délai de 24 heures'],
  cta_text: 'Démarrer via WhatsApp',
  contact_link: '/contact',
}

const ProHostingCheckout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const price = proService.price ?? 0;
  const templateTitle = new URLSearchParams(window.location.search).get("template") || undefined;

  // Redirect if not authenticated
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour continuer.",
        variant: "destructive",
      });
      navigate("/auth?redirect=/checkout/pro-hosting");
    }
  }, [user, loading, navigate, toast]);

  // Load PayPal SDK
  useEffect(() => {
    if (orderComplete) return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId || clientId.startsWith("YOUR_")) {
      setPaypalError("PayPal n'est pas configuré. Ajoutez votre ID client PayPal.");
      return;
    }

    // Don't add duplicate scripts
    if (document.querySelector(`script[src*="paypal.com/sdk"]`)) {
      if (window.paypal) setPaypalLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setPaypalError("Failed to load PayPal.");
    document.body.appendChild(script);
  }, [orderComplete]);

  // Render PayPal buttons
  useEffect(() => {
    if (!paypalLoaded || !window.paypal || orderComplete) return;

    const container = document.getElementById("paypal-pro-hosting-container");
    if (!container) return;
    container.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: async () => {
          setIsLoading(true);
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            const response = await supabase.functions.invoke("create-paypal-order", {
              body: { items: [], isAllAccess: false, isProHosting: true, templateTitle },
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });

            if (response.error) throw new Error(response.error.message || "Échec de la création de la commande");
            return response.data.orderId;
          } catch (error: any) {
            toast({ title: "Erreur de commande", description: error.message, variant: "destructive" });
            throw error;
          } finally {
            setIsLoading(false);
          }
        },
        onApprove: async (data: any) => {
          setIsLoading(true);
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            const response = await supabase.functions.invoke("capture-paypal-order", {
              body: {
                paypalOrderId: data.orderID,
                items: [],
                isAllAccess: false,
                isProHosting: true,
                templateTitle,
                proHostingNotes: notes,
              },
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });

            if (response.error) throw new Error(response.error.message || "Failed to capture payment");

            setOrderId(response.data.orderId);
            setOrderComplete(true);
            toast({ title: "Paiement réussi !", description: "Notre équipe vous contactera sous peu." });
          } catch (error: any) {
            toast({ title: "Erreur de paiement", description: error.message, variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        },
        onError: () => toast({ title: "Erreur de paiement", description: "Une erreur est survenue avec PayPal.", variant: "destructive" }),
        onCancel: () => toast({ title: "Paiement annulé", description: "Vous avez annulé le paiement." }),
      })
      .render("#paypal-pro-hosting-container");
  }, [paypalLoaded, orderComplete, notes, templateTitle]);

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-9 pb-16">
          <div className="container mx-auto max-w-2xl">
            <div className="glass-card p-8 rounded-2xl border border-border/50 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-accent" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Demande d'hébergement Pro envoyée !
              </h1>
              <p className="text-muted-foreground mb-6">
                Notre équipe a reçu votre demande d'hébergement. Nous vous contacterons sous 24 heures pour commencer le déploiement.
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-8">
                  Order ID: <span className="font-mono text-foreground">{orderId}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/dashboard">
                  <Button variant="hero">Tableau de bord</Button>
                </Link>
                <Link to="/templates">
                  <Button variant="ghost">Continuer</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
            Paiement Hébergement Pro
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Column */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Moyen de paiement
                </h2>

                <div className="mb-4">
                  <Label className="text-muted-foreground">E-mail</Label>
                  <Input value={user?.email || ""} disabled className="mt-1 bg-muted/50" />
                </div>

                <div className="mb-6">
                  <Label className="text-muted-foreground">Notes supplémentaires (optionnel)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Décrivez vos besoins pour l'hébergement..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {paypalError && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 mb-4">
                    <p className="text-sm text-destructive font-medium">{paypalError}</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Traitement...</span>
                  </div>
                )}

                <div id="paypal-pro-hosting-container" className={isLoading || paypalError ? "hidden" : ""} />

                {!paypalLoaded && !isLoading && !paypalError && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Chargement...</span>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-sm">Votre paiement est sécurisé par la protection des acheteurs PayPal</span>
                </div>
              </div>
            </div>

            {/* Récapitulatif Column */}
            <div>
              <div className="glass-card p-6 rounded-2xl border border-border/50 sticky top-24">
                <h2 className="font-semibold text-lg text-foreground mb-4">Récapitulatif</h2>

                <div className="flex gap-4 items-center mb-6">
                  <div className="w-16 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">Service Hébergement Pro</h3>
                    <p className="text-xs text-muted-foreground">
                      {templateTitle ? `For: ${templateTitle}` : "Assistance au déploiement professionnelle"}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">${price}</span>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 mb-4">
                  {proService.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-accent shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="text-foreground">${price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxe</span>
                    <span className="text-foreground">$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg pt-2">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ProHostingCheckout;
