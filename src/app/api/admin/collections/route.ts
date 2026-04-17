/**
 * GET  /api/admin/collections — Liste toutes les collections
 * POST /api/admin/collections — Crée une collection
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
    const collections = await prisma.collection.findMany({
      orderBy: { nom: 'asc' },
      include: { _count: { select: { produits: true } } },
    })
    return NextResponse.json({ collections })
  } catch (error) {
    console.error('[GET /api/admin/collections]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { nom, description, imageUrl } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })

    const slug = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const collection = await prisma.collection.create({
      data: { slug, nom, description: description ?? null, imageUrl: imageUrl ?? null },
    })
    return NextResponse.json({ collection }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/collections]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
