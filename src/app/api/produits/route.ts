/**
 * GET /api/produits — Produits publics pour la boutique (lecture seule)
 * Lit depuis la DB avec images, tailles et collection.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const genre = searchParams.get('genre')
  const statut = searchParams.get('statut')
  const slug = searchParams.get('slug')
  const categorie = searchParams.get('categorie')
  const collectionSlug = searchParams.get('collection')

  try {
    const where: Record<string, unknown> = { actif: true }
    if (genre) where.genre = genre.toUpperCase()
    if (statut) where.statut = statut.toUpperCase()
    if (slug) where.slug = slug
    if (categorie) where.categorie = categorie
    if (collectionSlug) where.collection = { slug: collectionSlug }

    const produits = await prisma.produit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { ordre: 'asc' } },
        tailles: { orderBy: { label: 'asc' } },
        collection: { select: { id: true, slug: true, nom: true } },
      },
    })

    return NextResponse.json({ produits, total: produits.length })
  } catch (error) {
    console.error('[GET /api/produits]', error)
    return NextResponse.json({ produits: [], total: 0, error: 'DB indisponible' })
  }
}
