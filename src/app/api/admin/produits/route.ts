import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const [produits] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, c.id AS cId, c.slug AS cSlug, c.nom AS cNom
       FROM produits p
       LEFT JOIN collections c ON c.id = p.collectionId
       ORDER BY p.createdAt DESC`
    )
    if (produits.length === 0) return NextResponse.json({ produits: [] })

    const ids = produits.map(p => p.id)
    const ph = ids.map(() => '?').join(',')
    const [images] = await pool.execute<RowDataPacket[]>(`SELECT * FROM produit_images WHERE produitId IN (${ph}) ORDER BY ordre ASC`, ids)
    const [tailles] = await pool.execute<RowDataPacket[]>(`SELECT * FROM produit_tailles WHERE produitId IN (${ph}) ORDER BY label ASC`, ids)
    const [ligneCounts] = await pool.execute<RowDataPacket[]>(`SELECT produitId, COUNT(*) AS cnt FROM commande_lignes WHERE produitId IN (${ph}) GROUP BY produitId`, ids)

    const result = produits.map(p => ({
      ...p,
      actif: Boolean(p.actif),
      images: images.filter(i => i.produitId === p.id),
      tailles: tailles.filter(t => t.produitId === p.id),
      collection: p.collectionId ? { id: p.cId, slug: p.cSlug, nom: p.cNom } : null,
      _count: { lignesCommande: Number(ligneCounts.find(l => l.produitId === p.id)?.cnt ?? 0) },
    }))
    return NextResponse.json({ produits: result })
  } catch (error) {
    console.error('[GET /api/admin/produits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const body = await req.json()
    const { nom, slug, description, prix, prixOriginal, marque, genre, statut, stock, actif, categorie, collectionId, images, tailles } = body

    if (!nom || !slug || !prix) return NextResponse.json({ error: 'Nom, slug et prix requis.' }, { status: 400 })
    if (!images || !Array.isArray(images) || images.length === 0) return NextResponse.json({ error: 'Au moins une image est obligatoire.' }, { status: 400 })

    const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM produits WHERE slug=? LIMIT 1', [slug])
    if (existing.length > 0) return NextResponse.json({ error: 'Ce slug existe déjà.' }, { status: 409 })

    const id = randomUUID()
    const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-')
    await pool.execute(
      `INSERT INTO produits (id, slug, nom, description, prix, prixOriginal, marque, genre, statut, stock, actif, categorie, collectionId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, cleanSlug, nom.trim(), description?.trim() || null, parseInt(prix),
       prixOriginal ? parseInt(prixOriginal) : null, marque?.trim() || 'WOG Style',
       genre ?? 'UNISEXE', statut ?? 'STANDARD', parseInt(stock ?? '0'),
       actif !== false ? 1 : 0, categorie ?? 'vetements', collectionId ?? null]
    )
    for (let i = 0; i < images.length; i++) {
      await pool.execute('INSERT INTO produit_images (id, url, ordre, isHover, produitId) VALUES (?, ?, ?, ?, ?)', [randomUUID(), images[i], i, i === 1 ? 1 : 0, id])
    }
    if (tailles?.length) {
      for (const t of tailles) {
        await pool.execute('INSERT INTO produit_tailles (id, label, stock, disponible, produitId) VALUES (?, ?, ?, ?, ?)', [randomUUID(), t.label, t.stock ?? 0, t.disponible !== false ? 1 : 0, id])
      }
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produits WHERE id=?', [id])
    const [imgRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produit_images WHERE produitId=? ORDER BY ordre ASC', [id])
    const [tailleRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM produit_tailles WHERE produitId=?', [id])
    return NextResponse.json({ produit: { ...rows[0], images: imgRows, tailles: tailleRows } }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/produits]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
