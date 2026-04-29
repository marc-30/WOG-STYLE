/**
 * @fichier app/collection/genese/page.tsx
 * @rôle Page de la collection GENÈSE — hero + 3 sous-collections inline.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SousCollectionGallery from './SousCollectionGallery'

export const metadata: Metadata = {
  title: 'Collection GENÈSE | WOG-STYLE',
  description:
    'GENÈSE — La première collection WOG-STYLE. Retour aux origines, aux matières brutes et aux couleurs de la terre.',
}

const SOUS_COLLECTIONS = [
  {
    slug: 'aura-verte',
    name: 'AURA VERTE',
    color: '#2D4A2D',
    description:
      'La forêt comme refuge. Des tons profonds, des matières naturelles, des coupes libres qui respectent le mouvement du corps. AURA VERTE puise son inspiration dans la densité des sous-bois et la sérénité des espaces verts protégés.',
    images: [
      { src: '/images/genese/aura-verte-1.jpg', legende: 'Look I — Profondeur végétale' },
      { src: '/images/genese/aura-verte-2.jpg', legende: 'Look II — Coupes libres' },
      { src: '/images/genese/aura-verte-3.jpg', legende: 'Look III — Refuge forestier' },
    ],
  },
  {
    slug: 'bogolan',
    name: 'BOGOLAN',
    color: '#5C3A1E',
    description:
      "Héritage textile de l'Afrique de l'Ouest. Les motifs bogolan, techniques d'impression ancestrales transmises de génération en génération, rencontrent des coupes contemporaines pour une mode qui parle d'identité et d'appartenance.",
    images: [
      { src: '/images/genese/bogolan-1.jpg', legende: 'Look I — Motifs ancestraux' },
      { src: '/images/genese/bogolan-3.jpg', legende: "Look II — Héritage de l'Ouest" },
      { src: '/images/genese/bogolan-royal-1.jpg', legende: 'Look III — Bogolan Royal' },
    ],
    quote: "Le bogolan n'est pas qu'un tissu — c'est une mémoire collective, une cartographie de nos origines tissée fil après fil.",
  },
  {
    slug: 'emeraude-royale',
    name: 'ÉMERAUDE ROYALE',
    color: '#1A3A2A',
    description:
      "La royauté en vert profond. ÉMERAUDE ROYALE convoque la majesté des cours africaines, la richesse des textiles d'apparat et la puissance tranquille de ceux qui savent qui ils sont. Pièces précieuses pour une présence affirmée.",
    images: [
      { src: '/images/genese/emeraude-royale-1.jpg', legende: 'Look I — La royauté en vert' },
      { src: '/images/genese/emeraude-royale-2.jpg', legende: 'Look II — Présence affirmée' },
      { src: '/images/genese/emeraude-royale-3.jpg', legende: 'Look III — Pièces précieuses' },
    ],
  },
]

export default function GenesePage() {
  return (
    <div className="bg-end-white">

      {/* ── HERO ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100svh - 130px)', minHeight: '360px', maxHeight: '800px' }}
      >
        <img
          src="/images/hero-2.jpg"
          alt="Collection GENÈSE — WOG-STYLE"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-10 sm:pb-16">
          <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-end-white/50 mb-4" aria-label="Fil d'ariane">
              <Link href="/" className="hover:text-end-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/collection" className="hover:text-end-white transition-colors">Collections</Link>
              <span>/</span>
              <span className="text-end-white/80">GENÈSE</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-2">
              Collection 2024 — WOG-STYLE
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-none text-end-white mb-3 sm:mb-4">
              GENÈSE
            </h1>
            <p className="text-xs sm:text-sm text-end-white/70 max-w-lg leading-relaxed mb-6">
              L'origine. Le commencement. GENÈSE est la première collection WOG-STYLE — un retour aux sources,
              aux matières brutes, aux couleurs de la terre et de la forêt.
            </p>
            <a
              href="#aura-verte"
              className="inline-flex items-center gap-2 bg-end-white text-end-black px-6 py-3 sm:px-8 sm:py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
            >
              Explorer la collection
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3v8M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── SOUS-COLLECTIONS INLINE ── */}
      {SOUS_COLLECTIONS.map((sc) => (
        <section key={sc.slug} id={sc.slug} className="border-t border-end-gray-border">

          {/* En-tête de la sous-collection */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-2">
              GENÈSE — Sous-collection
            </p>
            <h2
              className="text-3xl sm:text-5xl font-black uppercase leading-none mb-4"
              style={{ color: sc.color }}
            >
              {sc.name}
            </h2>
            <p className="text-sm text-end-gray-dark leading-relaxed max-w-xl">
              {sc.description}
            </p>
          </div>

          {/* Galerie interactive */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
            <div className="max-w-sm mx-auto sm:max-w-none">
              <SousCollectionGallery name={sc.name} images={sc.images} />
            </div>
          </div>

          {/* Citation BOGOLAN */}
          {'quote' in sc && (
            <div className="border-t border-end-gray-border py-10" style={{ backgroundColor: sc.color + '0D' }}>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <blockquote className="text-base sm:text-xl font-light italic text-end-black max-w-2xl mx-auto leading-relaxed">
                  &ldquo;{(sc as typeof sc & { quote: string }).quote}&rdquo;
                </blockquote>
                <p className="text-xs text-end-gray-mid uppercase tracking-widest mt-4">
                  — WOG Creative Studio, GENÈSE 2024
                </p>
              </div>
            </div>
          )}
        </section>
      ))}

      {/* ── CTA BOUTIQUE ── */}
      <section className="border-t border-end-gray-border bg-end-gray-light py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-3">
          Disponible maintenant
        </p>
        <h3 className="text-2xl sm:text-3xl font-black uppercase text-end-black mb-6">
          Acheter la collection GENÈSE
        </h3>
        <Link
          href="/boutique?collection=genese"
          className="inline-flex items-center gap-2 bg-end-black text-end-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          Voir tous les produits
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </section>
    </div>
  )
}
