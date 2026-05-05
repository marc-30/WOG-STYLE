/**
 * GET  /api/admin/produits  — Liste tous les produits avec images + tailles
 * POST /api/admin/produits  — Crée un produit complet
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const produits = await prisma.produit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { ordre: 'asc' } },
        tailles: { orderBy: { label: 'asc' } },
        collection: { select: { id: true, slug: true, nom: true } },
        _count: { select: { lignesCommande: true } },
      },
    })
    return NextResponse.json({ produits })
  } catch (error) {
    console.error('[GET /api/admin/produits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const body = await req.json()
    const { nom, slug, description, prix, prixOriginal, marque, genre, statut, stock, actif, categorie, collectionId, images, tailles } = body

    if (!nom || !slug || !prix) {
      return NextResponse.json({ error: 'Nom, slug et prix requis.' }, { status: 400 })
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Au moins une image est obligatoire.' }, { status: 400 })
    }

    // Vérifier unicité du slug
    const existing = await prisma.produit.findUnique({ where: { slug } })
    if (existing) return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 409 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const produit = await (prisma.produit.create as any)({
      data: {
        nom: nom.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description?.trim() || null,
        prix: parseInt(prix),
        prixOriginal: prixOriginal ? parseInt(prixOriginal) : null,
        marque: marque?.trim() || 'WOG Style',
        genre: genre ?? 'UNISEXE',
        statut: statut ?? 'STANDARD',
        stock: parseInt(stock ?? '0'),
        actif: actif !== false,
        categorie: categorie ?? 'vetements',
        collectionId: collectionId ?? null,
        images: images?.length ? {
          create: images.map((url: string, i: number) => ({
            url,
            ordre: i,
            isHover: i === 1,
          })),
        } : undefined,
        tailles: tailles?.length ? {
          create: tailles.map((t: { label: string; stock?: number; disponible?: boolean }) => ({
            label: t.label,
            stock: t.stock ?? 0,
            disponible: t.disponible !== false,
          })),
        } : undefined,
      },
      include: {
        images: { orderBy: { ordre: 'asc' } },
        tailles: true,
        collection: { select: { id: true, slug: true, nom: true } },
      },
    })

    return NextResponse.json({ produit }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/produits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
