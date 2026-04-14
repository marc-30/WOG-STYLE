/**
 * @fichier app/page.tsx
 * @rôle Page d'accueil WOG-STYLE.
 *        Structure : Hero → News triptyque → Brand Focus →
 *        Shop Category (filtré par genre) → Drops & Exclusivités → Réassurances
 * @auteur Marc-dev
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import productsData from '@/data/products.json'
import type { Product } from '@/types'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = {
  title: 'WOG-STYLE | Mode Contemporaine & Éditions Limitées',
  description:
    'Découvrez WOG-STYLE : collections homme, femme et unisexe. Vêtements premium, drops exclusifs et éditions limitées.',
}

const allProducts = productsData as Product[]

export default function HomePage() {
  return (
    <div>

      {/* ============================================================
          HERO BANNER PRINCIPAL
          Image SL-1 plein écran avec CTA
          ============================================================ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100svh - 130px)', minHeight: '400px', maxHeight: '900px' }}
      >
        <img
          src="/images/AAAA.JPG" 
          alt="WOG-STYLE — Nouvelle Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="relative z-10 h-full flex items-end pb-16">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-end-white/70 mb-2 sm:mb-3">
                Nouvelle saison — Collection 2024
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase leading-none text-end-white mb-4 sm:mb-5">
                WOG<br />STYLE
              </h1>
              <p className="text-xs sm:text-sm text-end-white/80 mb-5 sm:mb-8 max-w-sm leading-relaxed">
                Mode contemporaine, drops exclusifs et éditions limitées pour ceux qui définissent leur propre style.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/collection"
                  className="inline-flex items-center gap-2 bg-end-white text-end-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
                >
                  Découvrir la collection
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/collection/genese"
                  className="inline-flex items-center gap-2 border border-end-white text-end-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-white hover:text-end-black transition-colors"
                >
                  Collection GENÈSE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTIONS INTERACTIVES (Client Component)
          1 — News triptyque éditorial
          2 — Brand Focus avec slider
          3 — Shop Category avec filtre genre HOMME/FEMME/UNISEXE
          ============================================================ */}
      <HomeClient products={allProducts} />

      {/* ============================================================
          DROPS & EXCLUSIVITÉS — BANNIÈRE PLEINE LARGEUR
          ============================================================ */}
      <section className="relative overflow-hidden border-t border-end-gray-border" style={{ height: '70vh', minHeight: '400px' }}>
        <img
          src="/images/hero-2.jpg"
          alt="WOG-STYLE — Drops & Exclusivités"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-end-white/70 mb-4">
            Éditions exclusives
          </p>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-end-white mb-6 leading-none">
            Drops &<br />Exclusivités
          </h2>
          <p className="text-sm text-end-white/70 mb-8 max-w-sm">
            Pièces limitées, collaborations créatives et releases spéciales WOG-STYLE.
          </p>
          <Link
            href="/collection?statut=exclusif"
            className="inline-flex items-center gap-2 bg-end-white text-end-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
          >
            Voir les exclusivités
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ============================================================
          RÉASSURANCES
          Livraison, retours, authenticité, service client
          ============================================================ */}
      <section className="border-t border-end-gray-border bg-end-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-end-gray-border">

            <div className="flex flex-col items-center text-center py-8 px-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3">
                <rect x="2" y="7" width="15" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M17 10h3l2 3v4h-5V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="7" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Livraison express</p>
              <p className="text-xs text-end-gray-mid">Gratuite dès 50 000 XOF</p>
            </div>

            <div className="flex flex-col items-center text-center py-8 px-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3">
                <path d="M4 4v5h5M20 12A8 8 0 104.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">28 jours de retour</p>
              <p className="text-xs text-end-gray-mid">Retours faciles et gratuits</p>
            </div>

            <div className="flex flex-col items-center text-center py-8 px-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Authenticité garantie</p>
              <p className="text-xs text-end-gray-mid">Pièces originales certifiées</p>
            </div>

            <div className="flex flex-col items-center text-center py-8 px-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3">
                <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Service client</p>
              <p className="text-xs text-end-gray-mid">7j/7 par chat et email</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
