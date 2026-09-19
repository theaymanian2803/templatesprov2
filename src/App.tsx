import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopOnNavigate from "./components/ScrollToTopOnNavigate";
import CookieConsent from "./components/CookieConsent";
import ChatBubble from "./components/ChatBubble";

const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) {
      window.setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [hash, pathname]);

  return null;
};

const TemplatePreview = lazy(() => import("./pages/TemplatePreview"));
const Templates = lazy(() => import("./pages/Templates"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const License = lazy(() => import("./pages/License"));
const Refunds = lazy(() => import("./pages/Refunds"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Downloads = lazy(() => import("./pages/Downloads"));
const ProHostingCheckout = lazy(() => import("./pages/ProHostingCheckout"));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#e85a2d]" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <MotionConfig reducedMotion="user">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ScrollToTop />
              <BrowserRouter>
                <ScrollToTopOnNavigate />
                <ScrollToHash />
                <CookieConsent />
                <ChatBubble />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/templates" element={<Suspense fallback={<PageLoader />}><Templates /></Suspense>} />
                  <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutUs /></Suspense>} />
                  <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQ /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
                  <Route path="/cart" element={<Suspense fallback={<PageLoader />}><Cart /></Suspense>} />
                  <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><Checkout /></Suspense>} />
                  <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />
                  <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
                  <Route path="/favorites" element={<Suspense fallback={<PageLoader />}><Favorites /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
                  <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
                  <Route path="/template/:id" element={<Suspense fallback={<PageLoader />}><TemplatePreview /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Privacy /></Suspense>} />
                  <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
                  <Route path="/cookies" element={<Suspense fallback={<PageLoader />}><Cookies /></Suspense>} />
                  <Route path="/license" element={<Suspense fallback={<PageLoader />}><License /></Suspense>} />
                  <Route path="/refunds" element={<Suspense fallback={<PageLoader />}><Refunds /></Suspense>} />
                  <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                  <Route path="/downloads" element={<Suspense fallback={<PageLoader />}><Downloads /></Suspense>} />
                  <Route path="/checkout/pro-hosting" element={<Suspense fallback={<PageLoader />}><ProHostingCheckout /></Suspense>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </MotionConfig>
);

export default App;