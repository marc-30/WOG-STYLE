/**
 * PATCH /api/admin/collections/[id] — Met à jour une collection
 * DELETE /api/admin/collections/[id] — Supprime une collection
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { nom, description, imageUrl, actif } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })

    const slug = nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        slug,
        nom,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        actif: actif ?? true,
      },
    })
    return NextResponse.json({ collection })
  } catch (error) {
    console.error('[PATCH /api/admin/collections/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    // Détacher les produits de cette collection avant suppression
    await prisma.produit.updateMany({
      where: { collectionId: params.id },
      data: { collectionId: null },
    })

    await prisma.collection.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/collections/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
