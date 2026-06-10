import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import pool from '@/lib/db'

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
    const fields: string[] = []
    const vals: (string | number | boolean | null | Date)[] = []
    if (body.titre !== undefined) { fields.push('titre=?'); vals.push(body.titre.trim()) }
    if (body.description !== undefined) { fields.push('description=?'); vals.push(body.description?.trim() || null) }
    if (body.priorite !== undefined) { fields.push('priorite=?'); vals.push(body.priorite) }
    if (body.statut !== undefined) { fields.push('statut=?'); vals.push(body.statut) }
    if (body.echeance !== undefined) { fields.push('echeance=?'); vals.push(body.echeance ? new Date(body.echeance) : null) }
    if (body.assignee !== undefined) { fields.push('assignee=?'); vals.push(body.assignee?.trim() || null) }
    if (fields.length === 0) return NextResponse.json({ error: 'Rien à mettre à jour.' }, { status: 400 })
    vals.push(params.id)
    await pool.execute(`UPDATE taches SET ${fields.join(', ')} WHERE id=?`, vals)
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM taches WHERE id=?', [params.id])
    return NextResponse.json({ tache: rows[0] })
  } catch (error) {
    console.error('[PATCH /api/admin/taches/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    await pool.execute('DELETE FROM taches WHERE id=?', [params.id])
    return NextResponse.json({ message: 'Tâche supprimée.' })
  } catch (error) {
    console.error('[DELETE /api/admin/taches/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
