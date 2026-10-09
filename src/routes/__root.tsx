import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import ScrollToTop from '@/components/ScrollToTop'
import CookieConsent from '@/components/CookieConsent'
import ChatBubble from '@/components/ChatBubble'

import '@/index.css'
import '@/i18n'

const queryClient = new QueryClient()

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico.png" />
        <title>Unccodestore — Templates Web Premium & Code Source</title>
        <meta name="author" content="Unccodestore" />
        <meta
          name="description"
          content="Unccodestore est la plateforme n°1 des templates web premium, du code source et des kits UI. Achetez des assets prêts pour la production pour développeurs et designers."
        />
        <meta
          property="og:description"
          content="Templates web premium et code source pour votre prochaine grande idée."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=Cairo:wght@400;500;600;700;800;900&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ScrollToTop />
                <CookieConsent />
                <ChatBubble />
                <Outlet />
              </TooltipProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  )
}

export const Route = createRootRoute({
  shellComponent: RootDocument,
  component: RootComponent,
})
