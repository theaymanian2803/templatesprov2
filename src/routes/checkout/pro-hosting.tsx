import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { useNavigate, Link } from "@/lib/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createPayPalOrder, capturePayPalOrder } from "@/server/functions/orders";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  Crown,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";

declare global {
  interface Window {
    paypal?: any;
  }
}

const ProHostingCheckout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const price = 0;
  const templateTitle = new URLSearchParams(window.location.search).get("template") || undefined;

  const features = [
    t('proHosting.feature1'),
    t('proHosting.feature2'),
    t('proHosting.feature3'),
    t('proHosting.feature4'),
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast({
        title: t('proHosting.loginRequired'),
        description: t('proHosting.loginRequiredDesc'),
        variant: "destructive",
      });
      navigate("/auth?redirect=/checkout/pro-hosting");
    }
  }, [user, loading, navigate, toast, t]);

  // Load PayPal SDK
  useEffect(() => {
    if (orderComplete) return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId || clientId.startsWith("YOUR_")) {
      setPaypalError(t('proHosting.paypalNotConfigured'));
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
    script.onerror = () => setPaypalError(t('proHosting.paypalLoadFailed'));
    document.body.appendChild(script);
  }, [orderComplete, t]);

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
            const result = await createPayPalOrder({
              data: { items: [], isAllAccess: false, isProHosting: true, templateTitle },
            });

            return result.orderId;
          } catch (error: any) {
            toast({ title: t('proHosting.orderError'), description: error.message, variant: "destructive" });
            throw error;
          } finally {
            setIsLoading(false);
          }
        },
        onApprove: async (data: any) => {
          setIsLoading(true);
          try {
            const result = await capturePayPalOrder({
              data: {
                paypalOrderId: data.orderID,
                items: [],
                isAllAccess: false,
                isProHosting: true,
                templateTitle,
                proHostingNotes: notes,
              },
            });

            setOrderId(result.orderId);
            setOrderComplete(true);
            toast({ title: t('proHosting.paymentSuccess'), description: t('proHosting.paymentSuccessDesc') });
          } catch (error: any) {
            toast({ title: t('proHosting.paymentError'), description: error.message, variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        },
        onError: () => toast({ title: t('proHosting.paymentError'), description: t('proHosting.paymentGeneric'), variant: "destructive" }),
        onCancel: () => toast({ title: t('proHosting.paymentCancelled'), description: t('proHosting.paymentCancelledDesc') }),
      })
      .render("#paypal-pro-hosting-container");
  }, [paypalLoaded, orderComplete, notes, templateTitle, t, toast]);

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
                {t('proHosting.doneHeading')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('proHosting.doneDesc')}
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-8">
                  {t('proHosting.orderId')} <span className="font-mono text-foreground">{orderId}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/dashboard">
                  <Button variant="hero">{t('proHosting.dashboard')}</Button>
                </Link>
                <Link to="/templates">
                  <Button variant="ghost">{t('proHosting.cont')}</Button>
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
            {t('proHosting.backToDashboard')}
          </Link>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
            {t('proHosting.pageTitle')}
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Column */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('proHosting.paymentMethod')}
                </h2>

                <div className="mb-4">
                  <Label className="text-muted-foreground">{t('proHosting.email')}</Label>
                  <Input value={user?.email || ""} disabled className="mt-1 bg-muted/50" />
                </div>

                <div className="mb-6">
                  <Label className="text-muted-foreground">{t('proHosting.notes')}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('proHosting.notesPlaceholder')}
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
                    <span className="ml-2 text-muted-foreground">{t('proHosting.processing')}</span>
                  </div>
                )}

                <div id="paypal-pro-hosting-container" className={isLoading || paypalError ? "hidden" : ""} />

                {!paypalLoaded && !isLoading && !paypalError && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{t('proHosting.loading')}</span>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-sm">{t('proHosting.secure')}</span>
                </div>
              </div>
            </div>

            {/* Récapitulatif Column */}
            <div>
              <div className="glass-card p-6 rounded-2xl border border-border/50 sticky top-24">
                <h2 className="font-semibold text-lg text-foreground mb-4">{t('proHosting.summary')}</h2>

                <div className="flex gap-4 items-center mb-6">
                  <div className="w-16 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">{t('proHosting.serviceName')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {templateTitle ? t('proHosting.forTemplate', { title: templateTitle }) : t('proHosting.deploymentHelp')}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">${price}</span>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 mb-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-accent shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('proHosting.subtotal')}</span>
                    <span className="text-foreground">${price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('proHosting.tax')}</span>
                    <span className="text-foreground">$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg pt-2">
                    <span className="text-foreground">{t('proHosting.total')}</span>
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

export const Route = createFileRoute('/checkout/pro-hosting')({ component: ProHostingCheckout })
