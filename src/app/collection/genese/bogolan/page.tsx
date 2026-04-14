/**
 * @fichier app/collection/genese/bogolan/page.tsx
 * @rôle Page de la sous-collection BOGOLAN — GENÈSE / WOG-STYLE.
 *       Affiche les 3 images éditoriales en cartes plein format (sans recadrage).
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "BOGOLAN — Collection GENÈSE | WOG-STYLE",
  description: "Héritage textile de l'Afrique de l'Ouest. Motifs ancestraux, coupes contemporaines. Sous-collection BOGOLAN — GENÈSE WOG-STYLE.",
}

const IMAGES = [
  {
    src: '/images/genese/bogolan-1.jpg',
    alt: 'BOGOLAN — Look 1',
    legende: 'Look I — Motifs ancestraux',
  },
  {
    src: '/images/genese/bogolan-3.jpg',
    alt: 'BOGOLAN — Look 2',
    legende: "Look II — Héritage de l'Ouest",
  },
  {
    src: '/images/genese/bogolan-royal-1.jpg',
    alt: 'BOGOLAN Royal — Look 3',
    legende: 'Look III — Bogolan Royal',
  },
]

export default function BogolonPage() {
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
            <span className="text-end-black font-semibold">BOGOLAN</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-3">
                GENÈSE — Sous-collection
              </p>
              <h1
                className="text-5xl sm:text-6xl font-black uppercase leading-none mb-4"
                style={{ color: '#5C3A1E' }}
              >
                BOGOLAN
              </h1>
              <p className="text-sm text-end-gray-dark leading-relaxed max-w-lg">
                Héritage textile de l'Afrique de l'Ouest. Les motifs bogolan, techniques d'impression
                ancestrales transmises de génération en génération, rencontrent des coupes contemporaines
                pour une mode qui parle d'identité et d'appartenance.
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
                  BOGOLAN
                </p>
                <p className="text-xs text-end-gray-mid mt-0.5">{img.legende}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          CITATION ÉDITORIALE
          ============================================================ */}
      <div className="border-y border-end-gray-border bg-[#5C3A1E]/5 py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-lg sm:text-xl font-light italic text-end-black max-w-2xl mx-auto leading-relaxed">
            "Le bogolan n'est pas qu'un tissu — c'est une mémoire collective,
            une cartographie de nos origines tissée fil après fil."
          </blockquote>
          <p className="text-xs text-end-gray-mid uppercase tracking-widest mt-4">
            — WOG Creative Studio, GENÈSE 2024
          </p>
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
