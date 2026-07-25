import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export async function PATCH(req: NextRequest, { params }: { params: { id: string; subId: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { nom, couleur, description, citation, images } = await req.json()

    const fields: string[] = []
    const vals: (string | null)[] = []
    if (nom !== undefined) { fields.push('nom=?', 'slug=?'); vals.push(nom.trim(), slugify(nom)) }
    if (couleur !== undefined) { fields.push('couleur=?'); vals.push(couleur || '#000000') }
    if (description !== undefined) { fields.push('description=?'); vals.push(description ?? null) }
    if (citation !== undefined) { fields.push('citation=?'); vals.push(citation ?? null) }

    if (fields.length > 0) {
      vals.push(params.subId)
      await pool.execute(`UPDATE sous_collections SET ${fields.join(', ')} WHERE id=?`, vals)
    }

    if (images !== undefined) {
      if (!Array.isArray(images) || images.length === 0) {
        return NextResponse.json({ error: 'Au moins une image est obligatoire.' }, { status: 400 })
      }
      await pool.execute('DELETE FROM sous_collection_images WHERE sousCollectionId=?', [params.subId])
      for (let i = 0; i < images.length; i++) {
        await pool.execute(
          'INSERT INTO sous_collection_images (id, url, legende, ordre, sousCollectionId) VALUES (?, ?, ?, ?, ?)',
          [randomUUID(), images[i], null, i, params.subId]
        )
      }
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM sous_collections WHERE id=?', [params.subId])
    if (!rows[0]) return NextResponse.json({ error: 'Sous-collection introuvable.' }, { status: 404 })
    const [imgRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM sous_collection_images WHERE sousCollectionId=? ORDER BY ordre ASC', [params.subId])
    return NextResponse.json({ sousCollection: { ...rows[0], images: imgRows } })
  } catch (error) {
    console.error('[PATCH /api/admin/collections/[id]/sous-collections/[subId]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; subId: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await pool.execute('DELETE FROM sous_collections WHERE id=?', [params.subId])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/collections/[id]/sous-collections/[subId]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
