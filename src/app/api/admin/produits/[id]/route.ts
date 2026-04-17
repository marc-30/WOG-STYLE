/**
 * GET    /api/admin/produits/[id] — Détail d'un produit
 * PATCH  /api/admin/produits/[id] — Modifie un produit (+ images + tailles)
 * DELETE /api/admin/produits/[id] — Supprime un produit
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const produit = await prisma.produit.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { ordre: 'asc' } }, tailles: true },
    })
    if (!produit) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })
    return NextResponse.json({ produit })
  } catch (error) {
    console.error('[GET /api/admin/produits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const body = await req.json()
    const { nom, slug, description, prix, prixOriginal, marque, genre, statut, stock, actif, categorie, collectionId, images, tailles } = body

    const updateData: Record<string, unknown> = {}
    if (nom !== undefined) updateData.nom = nom.trim()
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase().replace(/\s+/g, '-')
    if (description !== undefined) updateData.description = description?.trim() || null
    if (prix !== undefined) updateData.prix = parseInt(prix)
    if (prixOriginal !== undefined) updateData.prixOriginal = prixOriginal ? parseInt(prixOriginal) : null
    if (marque !== undefined) updateData.marque = marque.trim()
    if (genre !== undefined) updateData.genre = genre
    if (statut !== undefined) updateData.statut = statut
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (actif !== undefined) updateData.actif = Boolean(actif)
    if (categorie !== undefined) updateData.categorie = categorie
    if (collectionId !== undefined) updateData.collectionId = collectionId || null

    // Mise à jour atomique : supprimer et recréer images/tailles si fournis
    if (images !== undefined) {
      await prisma.produitImage.deleteMany({ where: { produitId: params.id } })
      if (images.length > 0) {
        await prisma.produitImage.createMany({
          data: images.map((url: string, i: number) => ({
            url,
            ordre: i,
            isHover: i === 1,
            produitId: params.id,
          })),
        })
      }
    }

    if (tailles !== undefined) {
      await prisma.produitTaille.deleteMany({ where: { produitId: params.id } })
      if (tailles.length > 0) {
        await prisma.produitTaille.createMany({
          data: tailles.map((t: { label: string; stock?: number; disponible?: boolean }) => ({
            label: t.label,
            stock: t.stock ?? 0,
            disponible: t.disponible !== false,
            produitId: params.id,
          })),
        })
      }
    }

    const produit = await prisma.produit.update({
      where: { id: params.id },
      data: updateData,
      include: {
        images: { orderBy: { ordre: 'asc' } },
        tailles: true,
        collection: { select: { id: true, slug: true, nom: true } },
      },
    })

    return NextResponse.json({ produit })
  } catch (error) {
    console.error('[PATCH /api/admin/produits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await prisma.produit.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Produit supprimé.' })
  } catch (error) {
    console.error('[DELETE /api/admin/produits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
