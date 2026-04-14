/**
 * @fichier app/layout.tsx
 * @rôle Layout racine de l'application Next.js (App Router).
 *        Définit les métadonnées globales, importe la police Inter,
 *        installe les providers globaux (QueryClient, ToastProvider)
 *        et positionne le Header, Footer et MiniCart autour du contenu.
 * @dépendances next, @tanstack/react-query, components/layout/*, components/ui/Toast
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MiniCart } from '@/components/layout/MiniCart'
import { ToastProvider } from '@/components/ui/Toast'
import { QueryProvider } from './QueryProvider'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

/* ============================================================
 * CHARGEMENT DE LA POLICE INTER
 * Chargé via next/font pour l'optimisation automatique (swap, subset)
 * ============================================================ */

/** Configuration de la police Inter avec les graisses nécessaires */
const inter = Inter({
  subsets: ['latin'],
  /* Graisses utilisées dans la charte typographique END. */
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  /* Variable CSS pour utilisation dans Tailwind */
  variable: '--font-inter',
  /* Chargement différé pour les performances */
  display: 'swap',
})

/* ============================================================
 * MÉTADONNÉES SEO
 * Définies ici pour s'appliquer à toutes les pages par défaut
 * ============================================================ */

/**
 * Métadonnées globales de l'application END. Clothing Clone.
 * Chaque page peut surcharger ces valeurs via son propre export `metadata`.
 */
export const metadata: Metadata = {
  title: {
    template: '%s — WOG-STYLE',
    default: 'WOG-STYLE | Mode Contemporaine & Éditions Limitées',
  },
  description:
    'Découvrez WOG-STYLE : collections homme, femme et unisexe. Vêtements premium, drops exclusifs et éditions limitées. Livraison express.',
  keywords: [
    'WOG-STYLE',
    'mode contemporaine',
    'collection GENÈSE',
    'vêtements premium',
    'Afrique de l\'Ouest',
    'streetwear',
    'éditions limitées',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'WOG-STYLE',
    title: 'WOG-STYLE | Mode Contemporaine & Éditions Limitées',
    description: 'Collections homme, femme et unisexe. Drops exclusifs WOG-STYLE.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

/**
 * Paramètres du viewport pour le responsive mobile-first.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

/* ============================================================
 * LAYOUT RACINE
 * ============================================================ */

/**
 * RootLayout — layout racine Next.js App Router.
 *
 * Installe dans l'ordre :
 * 1. QueryProvider : React Query pour les données asynchrones
 * 2. ToastProvider : système de notifications globales
 * 3. Header : navigation sticky
 * 4. main : contenu de la page courante
 * 5. Footer : pied de page
 * 6. MiniCart : drawer panier overlay (en dehors du flux normal)
 *
 * @param children - Contenu de la page courante injecté par Next.js
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* lang="fr" pour l'accessibilité et le SEO multilingue */
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        {/* Fournisseur React Query pour les requêtes de données */}
        <QueryProvider>
          {/* Fournisseur du système de toasts — englobe tout l'arbre */}
          <ToastProvider>

            {/* === STRUCTURE DE LA PAGE ===
                Flexbox vertical : header + contenu flexible + footer collé en bas */}
            <div className="flex flex-col min-h-screen">

              {/* Header sticky — z-index 60 */}
              <Header />

              {/* Contenu principal — flex-1 pour occuper l'espace restant */}
              <main className="flex-1">
                {children}
              </main>

              {/* Footer — toujours en bas de page */}
              <Footer />
            </div>

            {/* Mini-panier drawer — en dehors du flux, z-index 70 */}
            <MiniCart />

            {/* Bouton WhatsApp flottant — visible sur toutes les pages */}
            <WhatsAppButton />

          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
