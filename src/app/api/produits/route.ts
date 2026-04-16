/**
 * GET /api/produits — Produits publics pour le store (lecture seule)
 * Lit depuis la DB. Fallback vers le JSON si DB vide.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const genre = searchParams.get('genre')
  const statut = searchParams.get('statut')
  const slug = searchParams.get('slug')

  try {
    const where: Record<string, unknown> = { actif: true }
    if (genre) where.genre = genre.toUpperCase()
    if (statut) where.statut = statut.toUpperCase()
    if (slug) where.slug = slug

    const produits = await prisma.produit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { ordre: 'asc' } },
        tailles: { orderBy: { label: 'asc' } },
      },
    })

    // Si la DB est vide, on indique qu'il faut seeder
    return NextResponse.json({ produits, total: produits.length })
  } catch (error) {
    console.error('[GET /api/produits]', error)
    return NextResponse.json({ produits: [], total: 0, error: 'DB indisponible' })
  }
}
