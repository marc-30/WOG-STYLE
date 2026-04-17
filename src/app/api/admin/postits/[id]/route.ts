/**
 * PATCH  /api/admin/postits/[id] — Modifie un post-it
 * DELETE /api/admin/postits/[id] — Supprime un post-it
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { contenu, couleur } = await req.json()
    const postit = await prisma.postIt.update({
      where: { id: params.id },
      data: {
        ...(contenu !== undefined && { contenu: contenu.trim() }),
        ...(couleur !== undefined && { couleur }),
      },
    })
    return NextResponse.json({ postit })
  } catch (error) {
    console.error('[PATCH /api/admin/postits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await prisma.postIt.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Post-it supprimé.' })
  } catch (error) {
    console.error('[DELETE /api/admin/postits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
