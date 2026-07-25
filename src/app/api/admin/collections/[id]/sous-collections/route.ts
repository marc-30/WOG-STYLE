import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const [sousCollections] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM sous_collections WHERE collectionId=? ORDER BY ordre ASC', [params.id]
    )
    if (sousCollections.length === 0) return NextResponse.json({ sousCollections: [] })

    const ids = sousCollections.map(s => s.id)
    const ph = ids.map(() => '?').join(',')
    const [images] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM sous_collection_images WHERE sousCollectionId IN (${ph}) ORDER BY ordre ASC`, ids
    )
    const result = sousCollections.map(s => ({ ...s, images: images.filter(i => i.sousCollectionId === s.id) }))
    return NextResponse.json({ sousCollections: result })
  } catch (error) {
    console.error('[GET /api/admin/collections/[id]/sous-collections]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { nom, couleur, description, citation, images } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Au moins une image est obligatoire.' }, { status: 400 })
    }

    const [[{ maxOrdre }]] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(MAX(ordre), -1) AS maxOrdre FROM sous_collections WHERE collectionId=?', [params.id]
    )

    const id = randomUUID()
    await pool.execute(
      'INSERT INTO sous_collections (id, slug, nom, couleur, description, citation, ordre, collectionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, slugify(nom), nom.trim(), couleur || '#000000', description ?? null, citation ?? null, maxOrdre + 1, params.id]
    )
    for (let i = 0; i < images.length; i++) {
      await pool.execute(
        'INSERT INTO sous_collection_images (id, url, legende, ordre, sousCollectionId) VALUES (?, ?, ?, ?, ?)',
        [randomUUID(), images[i], null, i, id]
      )
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM sous_collections WHERE id=?', [id])
    const [imgRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM sous_collection_images WHERE sousCollectionId=? ORDER BY ordre ASC', [id])
    return NextResponse.json({ sousCollection: { ...rows[0], images: imgRows } }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/collections/[id]/sous-collections]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
