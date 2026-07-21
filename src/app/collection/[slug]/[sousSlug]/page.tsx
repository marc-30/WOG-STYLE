/**
 * @fichier app/collection/[slug]/[sousSlug]/page.tsx
 * @rôle Page dédiée d'une sous-collection éditoriale (grille plein format + citation + nav croisée).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CollectionRow extends RowDataPacket { id: string; slug: string; nom: string }
interface SousCollectionRow extends RowDataPacket {
  id: string; slug: string; nom: string; couleur: string
  description: string | null; citation: string | null
}
interface ImageRow extends RowDataPacket { url: string; legende: string | null }

async function getData(slug: string, sousSlug: string) {
  const [colRows] = await pool.execute<CollectionRow[]>(
    'SELECT id, slug, nom FROM collections WHERE slug=? AND actif=1 LIMIT 1', [slug]
  )
  const collection = colRows[0]
  if (!collection) return null

  const [scRows] = await pool.execute<SousCollectionRow[]>(
    'SELECT * FROM sous_collections WHERE collectionId=? AND slug=? LIMIT 1', [collection.id, sousSlug]
  )
  const sousCollection = scRows[0]
  if (!sousCollection) return null

  const [images] = await pool.execute<ImageRow[]>(
    'SELECT url, legende FROM sous_collection_images WHERE sousCollectionId=? ORDER BY ordre ASC', [sousCollection.id]
  )
  const [siblings] = await pool.execute<SousCollectionRow[]>(
    'SELECT * FROM sous_collections WHERE collectionId=? AND id<>? ORDER BY ordre ASC', [collection.id, sousCollection.id]
  )

  return { collection, sousCollection, images, siblings }
}

export async function generateMetadata(
  { params }: { params: { slug: string; sousSlug: string } }
): Promise<Metadata> {
  const data = await getData(params.slug, params.sousSlug)
  if (!data) return {}
  return {
    title: `${data.sousCollection.nom} — Collection ${data.collection.nom} | WOG-STYLE`,
    description: data.sousCollection.description || undefined,
  }
}

export default async function SousCollectionPage(
  { params }: { params: { slug: string; sousSlug: string } }
) {
  const data = await getData(params.slug, params.sousSlug)
  if (!data) notFound()
  const { collection, sousCollection, images, siblings } = data

  return (
    <div className="min-h-screen bg-end-white">

      {/* ============================================================
          EN-TÊTE ÉDITORIAL
          ============================================================ */}
      <div className="border-b border-end-gray-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-8" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-end-black transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/collection" className="hover:text-end-black transition-colors">Collections</Link>
            <span>/</span>
            <Link href={`/collection/${collection.slug}`} className="hover:text-end-black transition-colors">{collection.nom}</Link>
            <span>/</span>
            <span className="text-end-black font-semibold">{sousCollection.nom}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-3">
                {collection.nom} — Sous-collection
              </p>
              <h1
                className="text-5xl sm:text-6xl font-black uppercase leading-none mb-4"
                style={{ color: sousCollection.couleur }}
              >
                {sousCollection.nom}
              </h1>
              {sousCollection.description && (
                <p className="text-sm text-end-gray-dark leading-relaxed max-w-lg">
                  {sousCollection.description}
                </p>
              )}
            </div>
            <div className="text-xs text-end-gray-mid uppercase tracking-widest">
              {images.length} pièce{images.length !== 1 ? 's' : ''} éditoriale{images.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          GRILLE D'IMAGES — cartes plein format
          ============================================================ */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <div key={i} className="group bg-end-white border border-end-gray-border overflow-hidden">
              <div className="relative bg-end-gray-light" style={{ aspectRatio: '3/4' }}>
                <img
                  src={img.url}
                  alt={img.legende || `${sousCollection.nom} — Look ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="px-4 py-3 border-t border-end-gray-border">
                <p className="text-xs font-bold uppercase tracking-widest text-end-black">
                  {sousCollection.nom}
                </p>
                {img.legende && <p className="text-xs text-end-gray-mid mt-0.5">{img.legende}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          CITATION ÉDITORIALE
          ============================================================ */}
      {sousCollection.citation && (
        <div className="border-y border-end-gray-border py-12" style={{ backgroundColor: sousCollection.couleur + '0D' }}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote className="text-lg sm:text-xl font-light italic text-end-black max-w-2xl mx-auto leading-relaxed">
              &ldquo;{sousCollection.citation}&rdquo;
            </blockquote>
            <p className="text-xs text-end-gray-mid uppercase tracking-widest mt-4">
              — WOG Creative Studio
            </p>
          </div>
        </div>
      )}

      {/* ============================================================
          NAVIGATION ENTRE SOUS-COLLECTIONS
          ============================================================ */}
      {siblings.length > 0 && (
        <div className="border-t border-end-gray-border bg-end-gray-light">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-4 text-center">
              Autres sous-collections {collection.nom}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {siblings.map(sib => (
                <Link
                  key={sib.id}
                  href={`/collection/${collection.slug}/${sib.slug}`}
                  className="inline-flex items-center gap-2 border border-end-gray-border px-6 py-3 text-xs font-bold uppercase tracking-widest text-end-black hover:bg-end-black hover:text-end-white transition-colors"
                >
                  {sib.nom}
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href={`/collection/${collection.slug}`}
                className="inline-flex items-center gap-2 text-xs text-end-gray-mid hover:text-end-black transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Retour à {collection.nom}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
