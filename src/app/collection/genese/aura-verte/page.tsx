/**
 * @fichier app/collection/genese/aura-verte/page.tsx
 * @rôle Page de la sous-collection AURA VERTE — GENÈSE / WOG-STYLE.
 *       Affiche les 3 images éditoriales en cartes plein format (sans recadrage).
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AURA VERTE — Collection GENÈSE | WOG-STYLE',
  description: 'La forêt comme refuge. Des tons profonds, des coupes libres. Sous-collection AURA VERTE — GENÈSE WOG-STYLE.',
}

const IMAGES = [
  {
    src: '/images/genese/aura-verte-1.jpg',
    alt: 'AURA VERTE — Look 1',
    legende: 'Look I — Profondeur végétale',
  },
  {
    src: '/images/genese/aura-verte-2.jpg',
    alt: 'AURA VERTE — Look 2',
    legende: 'Look II — Coupes libres',
  },
  {
    src: '/images/genese/aura-verte-3.jpg',
    alt: 'AURA VERTE — Look 3',
    legende: 'Look III — Refuge forestier',
  },
]

export default function AuraVertePage() {
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
            <span className="text-end-black font-semibold">AURA VERTE</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-3">
                GENÈSE — Sous-collection
              </p>
              <h1 className="text-5xl sm:text-6xl font-black uppercase leading-none text-end-black mb-4"
                style={{ color: '#2D4A2D' }}>
                AURA VERTE
              </h1>
              <p className="text-sm text-end-gray-dark leading-relaxed max-w-lg">
                La forêt comme refuge. Des tons profonds, des matières naturelles, des coupes libres
                qui respectent le mouvement du corps. AURA VERTE puise son inspiration dans la densité
                des sous-bois et la sérénité des espaces verts protégés.
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
              {/* Image en plein format — object-contain pour ne rien couper */}
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
                  AURA VERTE
                </p>
                <p className="text-xs text-end-gray-mid mt-0.5">{img.legende}</p>
              </div>
            </div>
          ))}
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
              href="/collection/genese/bogolan"
              className="inline-flex items-center gap-2 border border-end-gray-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-end-black hover:bg-end-black hover:text-end-white transition-colors"
            >
              BOGOLAN
            </Link>
            <Link
              href="/collection/genese/emeraude-royale"
              className="inline-flex items-center gap-2 border border-end-gray-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-end-black hover:bg-end-black hover:text-end-white transition-colors"
            >
              ÉMERAUDE ROYALE
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
