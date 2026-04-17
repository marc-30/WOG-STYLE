/**
 * GET  /api/admin/postits — Liste tous les post-its
 * POST /api/admin/postits — Crée un post-it
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
    const postits = await prisma.postIt.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ postits })
  } catch (error) {
    console.error('[GET /api/admin/postits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { contenu, couleur } = await req.json()
    if (!contenu?.trim()) return NextResponse.json({ error: 'Contenu requis.' }, { status: 400 })

    const postit = await prisma.postIt.create({
      data: { contenu: contenu.trim(), couleur: couleur ?? 'yellow' },
    })
    return NextResponse.json({ postit }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/postits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
