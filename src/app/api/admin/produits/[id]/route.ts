import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produits WHERE id=? LIMIT 1', [params.id])
    if (!rows[0]) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })
    const [images] = await pool.execute<RowDataPacket[]>('SELECT * FROM produit_images WHERE produitId=? ORDER BY ordre ASC', [params.id])
    const [tailles] = await pool.execute<RowDataPacket[]>('SELECT * FROM produit_tailles WHERE produitId=?', [params.id])
    return NextResponse.json({ produit: { ...rows[0], images, tailles } })
  } catch (error) {
    console.error('[GET /api/admin/produits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const body = await req.json()
    const { nom, slug, description, prix, prixOriginal, marque, genre, statut, stock, actif, categorie, collectionId, images, tailles } = body

    const fields: string[] = []
    const vals: (string | number | boolean | null | Date)[] = []
    if (nom !== undefined) { fields.push('nom=?'); vals.push(nom.trim()) }
    if (slug !== undefined) { fields.push('slug=?'); vals.push(slug.trim().toLowerCase().replace(/\s+/g, '-')) }
    if (description !== undefined) { fields.push('description=?'); vals.push(description?.trim() || null) }
    if (prix !== undefined) { fields.push('prix=?'); vals.push(parseInt(prix)) }
    if (prixOriginal !== undefined) { fields.push('prixOriginal=?'); vals.push(prixOriginal ? parseInt(prixOriginal) : null) }
    if (marque !== undefined) { fields.push('marque=?'); vals.push(marque.trim()) }
    if (genre !== undefined) { fields.push('genre=?'); vals.push(genre) }
    if (statut !== undefined) { fields.push('statut=?'); vals.push(statut) }
    if (stock !== undefined) { fields.push('stock=?'); vals.push(parseInt(stock)) }
    if (actif !== undefined) { fields.push('actif=?'); vals.push(Boolean(actif) ? 1 : 0) }
    if (categorie !== undefined) { fields.push('categorie=?'); vals.push(categorie) }
    if (collectionId !== undefined) { fields.push('collectionId=?'); vals.push(collectionId || null) }

    if (fields.length > 0) { vals.push(params.id); await pool.execute(`UPDATE produits SET ${fields.join(', ')} WHERE id=?`, vals) }

    if (images !== undefined) {
      await pool.execute('DELETE FROM produit_images WHERE produitId=?', [params.id])
      for (let i = 0; i < images.length; i++) {
        await pool.execute('INSERT INTO produit_images (id, url, ordre, isHover, produitId) VALUES (?, ?, ?, ?, ?)', [randomUUID(), images[i], i, i === 1 ? 1 : 0, params.id])
      }
    }
    if (tailles !== undefined) {
      await pool.execute('DELETE FROM produit_tailles WHERE produitId=?', [params.id])
      for (const t of tailles) {
        await pool.execute('INSERT INTO produit_tailles (id, label, stock, disponible, produitId) VALUES (?, ?, ?, ?, ?)', [randomUUID(), t.label, t.stock ?? 0, t.disponible !== false ? 1 : 0, params.id])
      }
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produits WHERE id=?', [params.id])
    const [imgRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produit_images WHERE produitId=? ORDER BY ordre ASC', [params.id])
    const [tailleRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produit_tailles WHERE produitId=?', [params.id])
    const [colRows] = await pool.execute<RowDataPacket[]>('SELECT id, slug, nom FROM collections WHERE id=? LIMIT 1', [rows[0]?.collectionId ?? ''])
    return NextResponse.json({ produit: { ...rows[0], images: imgRows, tailles: tailleRows, collection: colRows[0] ?? null } })
  } catch (error) {
    console.error('[PATCH /api/admin/produits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await pool.execute('DELETE FROM produits WHERE id=?', [params.id])
    return NextResponse.json({ message: 'Produit supprimé.' })
  } catch (error) {
    console.error('[DELETE /api/admin/produits/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
