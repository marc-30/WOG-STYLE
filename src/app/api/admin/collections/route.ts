import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, COUNT(p.id) AS produitsCount
       FROM collections c
       LEFT JOIN produits p ON p.collectionId = c.id
       GROUP BY c.id
       ORDER BY c.nom ASC`
    )
    const collections = rows.map(r => ({ ...r, actif: Boolean(r.actif), _count: { produits: Number(r.produitsCount) } }))
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
    const { nom, tagline, description, imageUrl, heroImage, hoverImage } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })
    const slug = nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const id = randomUUID()
    await pool.execute(
      'INSERT INTO collections (id, slug, nom, tagline, description, imageUrl, heroImage, hoverImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, slug, nom, tagline ?? null, description ?? null, imageUrl ?? null, heroImage ?? null, hoverImage ?? null]
    )
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM collections WHERE id = ?', [id])
    return NextResponse.json({ collection: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/collections]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
