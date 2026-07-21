/**
 * @fichier app/collection/page.tsx
 * @rôle Page Collections WOG-STYLE.
 *        Présente toutes les collections de la marque avec une intro éditoriale
 *        et les vignettes cliquables par collection.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import productsData from '@/data/products.json'
import type { Product } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Collections | WOG-STYLE',
  description:
    "Explorez les collections WOG-STYLE : GENÈSE et bien d'autres univers créatifs, entre artisanat contemporain et éditions limitées.",
}

const allProducts = productsData as Product[]

interface DbCollectionRow extends RowDataPacket {
  slug: string; nom: string; tagline: string | null
  imageUrl: string | null; hoverImage: string | null; createdAt: string; pieces: number
}

async function getDbCollections() {
  try {
    const [rows] = await pool.execute<DbCollectionRow[]>(
      `SELECT c.slug, c.nom, c.tagline, c.imageUrl, c.hoverImage, c.createdAt, COUNT(p.id) AS pieces
       FROM collections c
       LEFT JOIN produits p ON p.collectionId = c.id AND p.actif = 1
       WHERE c.actif = 1 AND c.heroImage IS NOT NULL
       GROUP BY c.id
       ORDER BY c.createdAt DESC`
    )
    return rows
  } catch {
    return []
  }
}

/* Définition des collections */
const COLLECTIONS = [
  {
    slug: 'genese',
    name: 'GENÈSE',
    tagline: "L'origine. Le commencement.",
    description:
      "GENÈSE est la première collection WOG-STYLE. Un retour aux sources, aux matières brutes, aux couleurs de la terre et de la forêt. Chaque pièce est une déclaration d'intention.",
    coverImage: '/images/genese/emeraude-royale-1.jpg',
    hoverImage: '/images/genese/aura-verte-1.jpg',
    products: allProducts.slice(0, 6),
    genre: 'UNISEXE',
    year: '2024',
    pieces: 9,
  },
  {
    slug: 'homme',
    name: 'WOG HOMME',
    tagline: "L'homme moderne. Affirmé.",
    description:
      "La ligne masculine WOG-STYLE : vêtements structurés, coupes précises et matières nobles pour l'homme qui sait ce qu'il veut.",
    coverImage: '/images/hero-3.jpg',
    hoverImage: '/images/prod-h1-main.jpg',
    products: allProducts.filter((p) => p.genre?.toUpperCase() === 'HOMME').slice(0, 6),
    genre: 'HOMME',
    year: '2024',
    pieces: allProducts.filter((p) => p.genre?.toUpperCase() === 'HOMME').length,
  },
  {
    slug: 'femme',
    name: 'WOG FEMME',
    tagline: 'La femme contemporaine.',
    description:
      'Silhouettes affirmées, matières sensibles et lignes épurées pour la femme qui incarne son style sans compromis.',
    coverImage: '/images/hero-1.jpg',
    hoverImage: '/images/prod-f1-main.jpg',
    products: allProducts.filter((p) => p.genre?.toUpperCase() === 'FEMME').slice(0, 6),
    genre: 'FEMME',
    year: '2024',
    pieces: allProducts.filter((p) => p.genre?.toUpperCase() === 'FEMME').length,
  },
  {
    slug: 'editorial',
    name: 'WOG ÉDITORIAL',
    tagline: 'Drops créatifs & collaborations.',
    description:
      "Pièces rares issues de collaborations artistiques et de drops éditoriaux limités. Pour ceux qui cherchent l'unique.",
    coverImage: '/images/editorial-1.jpg',
    hoverImage: '/images/editorial-2.jpg',
    products: allProducts.filter((p) => p.status === 'exclusive').slice(0, 6),
    genre: 'UNISEXE',
    year: '2024',
    pieces: allProducts.filter((p) => p.status === 'exclusive').length,
  },
]

export default async function CollectionPage() {
  const dbCollections = await getDbCollections()

  return (
    <div>

      {/* ============================================================
          INTRO ÉDITORIALE
          Grande image + texte de présentation de l'univers WOG
          ============================================================ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: '60vh', minHeight: '400px' }}
      >
        <img
          src="/images/logo.jpg"
          alt="WOG-STYLE Collections"
          className="absolute inset-0 w-full h-full object-contain object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-14 px-4">
          <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-3">
              WOG-STYLE
            </p>
            <h1 className="text-4xl sm:text-6xl font-black uppercase leading-none text-end-white mb-4">
              Nos<br />Collections
            </h1>
            <p className="text-sm text-end-white/70 max-w-md leading-relaxed">
              Chaque collection WOG-STYLE est une histoire. Un univers à explorer, des pièces à vivre.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          GRILLE DES COLLECTIONS
          Grandes vignettes avec survol et infos
          ============================================================ */}
      <section className="bg-end-white py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-end-gray-border">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.slug}
                href={`/collection/${collection.slug}`}
                className="group relative block overflow-hidden bg-end-white"
                style={{ minHeight: '60vh' }}
              >
                {/* Image de couverture */}
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-300" />

                {/* Contenu texte */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  {/* Genre badge */}
                  <span className="inline-block text-2xs font-bold uppercase tracking-widest bg-end-white/20 backdrop-blur-sm text-end-white px-3 py-1 mb-4 w-fit">
                    {collection.genre} — {collection.pieces} pièces
                  </span>

                  <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-2">
                    Collection {collection.year}
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-end-white leading-none mb-3">
                    {collection.name}
                  </h2>
                  <p className="text-sm text-end-white/70 italic mb-5 max-w-sm leading-relaxed">
                    {collection.tagline}
                  </p>

                  {/* CTA */}
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-end-white border-b border-end-white pb-0.5 w-fit group-hover:gap-4 transition-all">
                    Explorer
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}

            {dbCollections.map((collection) => (
              <Link
                key={collection.slug}
                href={`/collection/${collection.slug}`}
                className="group relative block overflow-hidden bg-end-white"
                style={{ minHeight: '60vh' }}
              >
                {/* Image de couverture */}
                <img
                  src={collection.imageUrl ?? collection.hoverImage ?? ''}
                  alt={collection.nom}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-300" />

                {/* Contenu texte */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="inline-block text-2xs font-bold uppercase tracking-widest bg-end-white/20 backdrop-blur-sm text-end-white px-3 py-1 mb-4 w-fit">
                    {collection.pieces} pièce{collection.pieces !== 1 ? 's' : ''}
                  </span>

                  <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-2">
                    Collection {new Date(collection.createdAt).getFullYear()}
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-end-white leading-none mb-3">
                    {collection.nom}
                  </h2>
                  {collection.tagline && (
                    <p className="text-sm text-end-white/70 italic mb-5 max-w-sm leading-relaxed">
                      {collection.tagline}
                    </p>
                  )}

                  {/* CTA */}
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-end-white border-b border-end-white pb-0.5 w-fit group-hover:gap-4 transition-all">
                    Explorer
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BANDE DE RÉASSURANCE — BAS DE PAGE
          ============================================================ */}
      <section className="border-t border-end-gray-border bg-end-gray-light py-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-end-gray-mid uppercase tracking-wider">
            Toutes les pièces WOG-STYLE sont fabriquées en édition limitée — authenticité garantie.
          </p>
        </div>
      </section>
    </div>
  )
}
