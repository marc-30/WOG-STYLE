/**
 * PATCH  /api/admin/taches/[id] — Modifie une tâche
 * DELETE /api/admin/taches/[id] — Supprime une tâche
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
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.titre !== undefined) data.titre = body.titre.trim()
    if (body.description !== undefined) data.description = body.description?.trim() || null
    if (body.priorite !== undefined) data.priorite = body.priorite
    if (body.statut !== undefined) data.statut = body.statut
    if (body.echeance !== undefined) data.echeance = body.echeance ? new Date(body.echeance) : null
    if (body.assignee !== undefined) data.assignee = body.assignee?.trim() || null

    const tache = await prisma.tache.update({ where: { id: params.id }, data })
    return NextResponse.json({ tache })
  } catch (error) {
    console.error('[PATCH /api/admin/taches/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await prisma.tache.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Tâche supprimée.' })
  } catch (error) {
    console.error('[DELETE /api/admin/taches/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
