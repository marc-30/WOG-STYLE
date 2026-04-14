/**
 * @fichier app/collection/genese/page.tsx
 * @rôle Page de la collection GENÈSE — WOG-STYLE.
 *       Présente la première collection de la marque avec un récit éditorial
 *       et les 9 images de la collection (Aura Verte, Bogolan, Émeraude Royale).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import productsData from '@/data/products.json'
import type { Product } from '@/types'

export const metadata: Metadata = {
  title: 'Collection GENÈSE | WOG-STYLE',
  description:
    'GENÈSE — La première collection WOG-STYLE. Retour aux origines, aux matières brutes et aux couleurs de la terre.',
}

const allProducts = productsData as Product[]
const geneseProduits = allProducts.slice(0, 6)

/* Sous-collections GENÈSE avec leurs images */
const SOUS_COLLECTIONS = [
  {
    slug: 'aura-verte',
    name: 'AURA VERTE',
    description: 'La forêt comme refuge. Des tons profonds, des coupes libres.',
    images: [
      '/images/genese/aura-verte-1.jpg',
      '/images/genese/aura-verte-2.jpg',
      '/images/genese/aura-verte-3.jpg',
    ],
    palette: '#2D4A2D',
  },
  {
    slug: 'bogolan',
    name: 'BOGOLAN',
    description: "Héritage textile de l'Afrique de l'Ouest. Motifs ancestraux, coupes contemporaines.",
    images: [
      '/images/genese/bogolan-1.jpg',
      '/images/genese/bogolan-3.jpg',
      '/images/genese/bogolan-royal-1.jpg',
    ],
    palette: '#5C3A1E',
  },
  {
    slug: 'emeraude-royale',
    name: 'ÉMERAUDE ROYALE',
    description: 'La royauté en vert profond. Pièces précieuses pour une présence affirmée.',
    images: [
      '/images/genese/emeraude-royale-1.jpg',
      '/images/genese/emeraude-royale-2.jpg',
      '/images/genese/emeraude-royale-3.jpg',
    ],
    palette: '#1A3A2A',
  },
]

export default function GenesePage() {
  return (
    <div>

      {/* ============================================================
          HERO PLEIN ÉCRAN — GENÈSE
          ============================================================ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: 'calc(100vh - 130px)', minHeight: '500px' }}
      >
        <img
          src="/images/hero-2.jpg"
          alt="Collection GENÈSE — WOG-STYLE"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-4">
          <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-end-white/50 mb-6" aria-label="Fil d'ariane">
              <Link href="/" className="hover:text-end-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/collection" className="hover:text-end-white transition-colors">Collections</Link>
              <span>/</span>
              <span className="text-end-white/80">GENÈSE</span>
            </nav>

            <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-3">
              Collection 2024 — WOG-STYLE
            </p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none text-end-white mb-4">
              GENÈSE
            </h1>
            <p className="text-sm text-end-white/70 max-w-lg leading-relaxed mb-8">
              L'origine. Le commencement. GENÈSE est la première collection WOG-STYLE — un retour aux sources,
              aux matières brutes, aux couleurs de la terre et de la forêt.
              9 pièces. 3 univers. Une seule vision.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#sous-collections"
                className="inline-flex items-center gap-2 bg-end-white text-end-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
              >
                Explorer la collection
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3v8M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          RÉCIT ÉDITORIAL
          Texte de présentation de la vision artistique
          ============================================================ */}
      <section className="bg-end-white py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-6">
              Note du créateur
            </p>
            <blockquote className="text-xl sm:text-2xl font-light leading-relaxed text-end-black mb-8 italic">
              "GENÈSE est née d'un désir de revenir à l'essentiel —
              la matière, la couleur, la forme. Sans artifice.
              Sans excès. Juste l'authenticité brute de ce que nous sommes."
            </blockquote>
            <p className="text-xs text-end-gray-mid uppercase tracking-wider">
              — WOG Creative Studio, 2024
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SOUS-COLLECTIONS — 3 UNIVERS
          Aura Verte / Bogolan / Émeraude Royale
          ============================================================ */}
      <section id="sous-collections" className="bg-end-white py-4">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {SOUS_COLLECTIONS.map((sousCollection, index) => (
            <div
              key={sousCollection.slug}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-0 mb-px ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Image principale grande */}
              <div
                className={`relative overflow-hidden ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}
                style={{ minHeight: '65vh' }}
              >
                <img
                  src={sousCollection.images[0]}
                  alt={sousCollection.name}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>

              {/* Colonne texte + 2 images secondaires */}
              <div
                className={`flex flex-col ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}
              >
                {/* Texte de présentation */}
                <div
                  className="flex flex-col justify-center p-10 lg:p-16 flex-1"
                  style={{ backgroundColor: sousCollection.palette + '15' }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-4">
                    GENÈSE — Sous-collection
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase leading-none text-end-black mb-6">
                    {sousCollection.name}
                  </h2>
                  <p className="text-sm text-end-gray-dark leading-relaxed mb-8 max-w-sm">
                    {sousCollection.description}
                  </p>
                  <Link
                    href={`/collection/genese/${sousCollection.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-end-black border-b border-end-black pb-0.5 w-fit hover:opacity-60 transition-opacity"
                  >
                    Voir les pièces
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </Link>
                </div>

                {/* Grille 2 images secondaires */}
                <div className="grid grid-cols-2 gap-px flex-1">
                  {sousCollection.images.slice(1, 3).map((img, i) => (
                    <div key={i} className="relative overflow-hidden" style={{ minHeight: '25vh' }}>
                      <img
                        src={img}
                        alt={`${sousCollection.name} — vue ${i + 2}`}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          PRODUITS ASSOCIÉS
          ============================================================ */}
      <section className="bg-end-gray-light py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-tight text-end-black">
              Pièces de la collection
            </h2>
            <span className="text-xs text-end-gray-mid">
              {geneseProduits.length} pièces
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-end-gray-border">
            {geneseProduits.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group block bg-end-white p-4 hover:shadow-md transition-shadow"
              >
                <div className="relative overflow-hidden mb-4" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={product.images?.[0] ?? product.mainImage.src}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.status !== 'standard' && (
                    <span className={`absolute top-2 left-2 text-2xs font-bold uppercase tracking-wider px-2 py-1 ${
                      product.status === 'new' ? 'bg-end-black text-end-white' :
                      product.status === 'exclusive' ? 'bg-end-black text-end-white' :
                      'bg-end-red text-end-white'
                    }`}>
                      {product.status === 'new' ? 'New' : product.status === 'exclusive' ? 'Exclusif' : 'Sale'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-end-gray-mid uppercase tracking-wider mb-1">{product.brand}</p>
                <p className="text-sm font-semibold text-end-black leading-tight mb-2 line-clamp-2">{product.name}</p>
                <p className="text-sm font-bold text-end-black">{product.price.toLocaleString('fr-FR')} XOF</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Retour collections */}
      <div className="bg-end-white border-t border-end-gray-border py-6 text-center">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-end-gray-mid hover:text-end-black transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Toutes les collections
        </Link>
      </div>
    </div>
  )
}
