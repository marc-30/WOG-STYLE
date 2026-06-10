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
    const { nom, description, imageUrl, actif } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })
    const slug = nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await pool.execute('UPDATE collections SET slug=?, nom=?, description=?, imageUrl=?, actif=? WHERE id=?', [slug, nom, description ?? null, imageUrl ?? null, actif !== false ? 1 : 0, params.id])
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM collections WHERE id = ?', [params.id])
    if (!rows[0]) return NextResponse.json({ error: 'Collection introuvable.' }, { status: 404 })
    return NextResponse.json({ collection: rows[0] })
  } catch (error) {
    console.error('[PATCH /api/admin/collections/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    await pool.execute('UPDATE produits SET collectionId=NULL WHERE collectionId=?', [params.id])
    await pool.execute('DELETE FROM collections WHERE id=?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/collections/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
