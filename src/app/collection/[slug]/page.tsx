/**
 * @fichier app/collection/[slug]/page.tsx
 * @rôle Page collection éditoriale pilotée depuis le dashboard (hero + sous-collections inline).
 *       Coexiste avec les routes statiques (/collection/genese, /collection/eden) qui restent prioritaires.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import SousCollectionGallery from '../genese/SousCollectionGallery'

export const dynamic = 'force-dynamic'

interface CollectionRow extends RowDataPacket {
  id: string; slug: string; nom: string; tagline: string | null
  description: string | null; heroImage: string | null
}
interface SousCollectionRow extends RowDataPacket {
  id: string; slug: string; nom: string; couleur: string
  description: string | null; citation: string | null
}
interface ImageRow extends RowDataPacket {
  id: string; url: string; legende: string | null; sousCollectionId: string
}

async function getCollection(slug: string) {
  const [rows] = await pool.execute<CollectionRow[]>(
    'SELECT * FROM collections WHERE slug=? AND actif=1 LIMIT 1', [slug]
  )
  const collection = rows[0]
  if (!collection) return null

  const [sousCollections] = await pool.execute<SousCollectionRow[]>(
    'SELECT * FROM sous_collections WHERE collectionId=? ORDER BY ordre ASC', [collection.id]
  )
  if (sousCollections.length === 0) return { collection, sousCollections: [] as (SousCollectionRow & { images: ImageRow[] })[] }

  const ids = sousCollections.map(s => s.id)
  const ph = ids.map(() => '?').join(',')
  const [images] = await pool.execute<ImageRow[]>(
    `SELECT * FROM sous_collection_images WHERE sousCollectionId IN (${ph}) ORDER BY ordre ASC`, ids
  )
  return {
    collection,
    sousCollections: sousCollections.map(sc => ({ ...sc, images: images.filter(i => i.sousCollectionId === sc.id) })),
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCollection(params.slug)
  if (!data) return {}
  return {
    title: `Collection ${data.collection.nom} | WOG-STYLE`,
    description: data.collection.tagline || data.collection.description || undefined,
  }
}

export default async function CollectionDynamicPage({ params }: { params: { slug: string } }) {
  const data = await getCollection(params.slug)
  if (!data) notFound()
  const { collection, sousCollections } = data

  return (
    <div className="bg-end-white">

      {/* ── HERO ── */}
      <section
        className="relative w-full overflow-hidden bg-end-black"
        style={{ height: 'calc(100svh - 130px)', minHeight: '360px', maxHeight: '800px' }}
      >
        {collection.heroImage && (
          <img
            src={collection.heroImage}
            alt={`Collection ${collection.nom} — WOG-STYLE`}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-10 sm:pb-16">
          <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-end-white/50 mb-4" aria-label="Fil d'ariane">
              <Link href="/" className="hover:text-end-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/collection" className="hover:text-end-white transition-colors">Collections</Link>
              <span>/</span>
              <span className="text-end-white/80">{collection.nom}</span>
            </nav>
            {collection.tagline && (
              <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-2">
                {collection.tagline}
              </p>
            )}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-none text-end-white mb-3 sm:mb-4">
              {collection.nom}
            </h1>
            {collection.description && (
              <p className="text-xs sm:text-sm text-end-white/70 max-w-lg leading-relaxed mb-6">
                {collection.description}
              </p>
            )}
            {sousCollections.length > 0 && (
              <a
                href={`#${sousCollections[0].slug}`}
                className="inline-flex items-center gap-2 bg-end-white text-end-black px-6 py-3 sm:px-8 sm:py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
              >
                Explorer la collection
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3v8M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── SOUS-COLLECTIONS INLINE ── */}
      {sousCollections.map((sc) => (
        <section key={sc.id} id={sc.slug} className="border-t border-end-gray-border">

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-2">
              {collection.nom} — Sous-collection
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <h2 className="text-3xl sm:text-5xl font-black uppercase leading-none" style={{ color: sc.couleur }}>
                {sc.nom}
              </h2>
              <Link
                href={`/collection/${collection.slug}/${sc.slug}`}
                className="text-xs font-bold uppercase tracking-widest text-end-black underline underline-offset-4 hover:opacity-60 transition-opacity flex-shrink-0"
              >
                Voir en détail →
              </Link>
            </div>
            {sc.description && (
              <p className="text-sm text-end-gray-dark leading-relaxed max-w-xl mt-4">
                {sc.description}
              </p>
            )}
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
            <div className="max-w-sm mx-auto sm:max-w-none">
              <SousCollectionGallery
                name={sc.nom}
                images={sc.images.map(img => ({ src: img.url, legende: img.legende || sc.nom }))}
              />
            </div>
          </div>

          {sc.citation && (
            <div className="border-t border-end-gray-border py-10" style={{ backgroundColor: sc.couleur + '0D' }}>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <blockquote className="text-base sm:text-xl font-light italic text-end-black max-w-2xl mx-auto leading-relaxed">
                  &ldquo;{sc.citation}&rdquo;
                </blockquote>
                <p className="text-xs text-end-gray-mid uppercase tracking-widest mt-4">
                  — WOG Creative Studio
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
          Acheter la collection {collection.nom}
        </h3>
        <Link
          href={`/boutique?collection=${collection.slug}`}
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
