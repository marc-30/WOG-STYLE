/**
 * @fichier app/collection/genese/emeraude-royale/page.tsx
 * @rôle Page de la sous-collection ÉMERAUDE ROYALE — GENÈSE / WOG-STYLE.
 *       Affiche les 3 images éditoriales en cartes plein format (sans recadrage).
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ÉMERAUDE ROYALE — Collection GENÈSE | WOG-STYLE',
  description: 'La royauté en vert profond. Pièces précieuses pour une présence affirmée. Sous-collection ÉMERAUDE ROYALE — GENÈSE WOG-STYLE.',
}

const IMAGES = [
  {
    src: '/images/genese/emeraude-royale-1.jpg',
    alt: 'ÉMERAUDE ROYALE — Look 1',
    legende: 'Look I — La royauté en vert',
  },
  {
    src: '/images/genese/emeraude-royale-2.jpg',
    alt: 'ÉMERAUDE ROYALE — Look 2',
    legende: 'Look II — Présence affirmée',
  },
  {
    src: '/images/genese/emeraude-royale-3.jpg',
    alt: 'ÉMERAUDE ROYALE — Look 3',
    legende: 'Look III — Pièces précieuses',
  },
]

export default function EmeraudeRoyalePage() {
  return (
    <div className="min-h-screen bg-end-white">

      {/* ============================================================
          EN-TÊTE ÉDITORIAL
          ============================================================ */}
      <div className="border-b border-end-gray-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          {/* Fil d'ariane */}
          <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-8" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-end-black transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/collection" className="hover:text-end-black transition-colors">Collections</Link>
            <span>/</span>
            <Link href="/collection/genese" className="hover:text-end-black transition-colors">GENÈSE</Link>
            <span>/</span>
            <span className="text-end-black font-semibold">ÉMERAUDE ROYALE</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-3">
                GENÈSE — Sous-collection
              </p>
              <h1
                className="text-5xl sm:text-6xl font-black uppercase leading-none mb-4"
                style={{ color: '#1A3A2A' }}
              >
                ÉMERAUDE<br />ROYALE
              </h1>
              <p className="text-sm text-end-gray-dark leading-relaxed max-w-lg">
                La royauté en vert profond. ÉMERAUDE ROYALE convoque la majesté des cours africaines,
                la richesse des textiles d'apparat et la puissance tranquille de ceux qui savent qui ils sont.
                Pièces précieuses pour une présence affirmée.
              </p>
            </div>
            <div className="text-xs text-end-gray-mid uppercase tracking-widest">
              {IMAGES.length} pièces éditoriales
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          GRILLE D'IMAGES — cartes plein format
          ============================================================ */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {IMAGES.map((img, i) => (
            <div
              key={i}
              className="group bg-end-white border border-end-gray-border overflow-hidden"
            >
              {/* Image en plein format — object-contain pour afficher l'image entière */}
              <div className="relative bg-end-gray-light" style={{ aspectRatio: '3/4' }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              {/* Légende */}
              <div className="px-4 py-3 border-t border-end-gray-border">
                <p className="text-xs font-bold uppercase tracking-widest text-end-black">
                  ÉMERAUDE ROYALE
                </p>
                <p className="text-xs text-end-gray-mid mt-0.5">{img.legende}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          BANNIÈRE PLEINE LARGEUR — image d'ambiance
          ============================================================ */}
      <div className="relative overflow-hidden" style={{ height: '40vh', minHeight: '280px' }}>
        <img
          src="/images/genese/emeraude-royale-1.jpg"
          alt="ÉMERAUDE ROYALE — ambiance"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 h-full flex items-end pb-10 px-4">
          <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-2">
              WOG-STYLE — GENÈSE 2024
            </p>
            <p className="text-2xl sm:text-3xl font-black uppercase text-end-white leading-tight max-w-sm">
              Porter la royauté comme une seconde peau.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          NAVIGATION ENTRE SOUS-COLLECTIONS
          ============================================================ */}
      <div className="border-t border-end-gray-border bg-end-gray-light">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-4 text-center">
            Autres sous-collections GENÈSE
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/collection/genese/aura-verte"
              className="inline-flex items-center gap-2 border border-end-gray-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-end-black hover:bg-end-black hover:text-end-white transition-colors"
            >
              AURA VERTE
            </Link>
            <Link
              href="/collection/genese/bogolan"
              className="inline-flex items-center gap-2 border border-end-gray-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-end-black hover:bg-end-black hover:text-end-white transition-colors"
            >
              BOGOLAN
            </Link>
          </div>
          <div className="text-center mt-6">
            <Link
              href="/collection/genese"
              className="inline-flex items-center gap-2 text-xs text-end-gray-mid hover:text-end-black transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retour à GENÈSE
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
