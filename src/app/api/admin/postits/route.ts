import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM postits ORDER BY createdAt DESC')
    return NextResponse.json({ postits: rows })
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
    const id = randomUUID()
    await pool.execute('INSERT INTO postits (id, contenu, couleur) VALUES (?, ?, ?)', [id, contenu.trim(), couleur ?? 'yellow'])
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM postits WHERE id = ?', [id])
    return NextResponse.json({ postit: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/postits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
