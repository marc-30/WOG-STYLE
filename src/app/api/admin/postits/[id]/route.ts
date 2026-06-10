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
    const { contenu, couleur } = await req.json()
    const fields: string[] = []
    const vals: (string | number | boolean | null | Date)[] = []
    if (contenu !== undefined) { fields.push('contenu=?'); vals.push(contenu.trim()) }
    if (couleur !== undefined) { fields.push('couleur=?'); vals.push(couleur) }
    if (fields.length === 0) return NextResponse.json({ error: 'Rien à mettre à jour.' }, { status: 400 })
    vals.push(params.id)
    await pool.execute(`UPDATE postits SET ${fields.join(', ')} WHERE id=?`, vals)
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM postits WHERE id=?', [params.id])
    return NextResponse.json({ postit: rows[0] })
  } catch (error) {
    console.error('[PATCH /api/admin/postits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    await pool.execute('DELETE FROM postits WHERE id=?', [params.id])
    return NextResponse.json({ message: 'Post-it supprimé.' })
  } catch (error) {
    console.error('[DELETE /api/admin/postits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
