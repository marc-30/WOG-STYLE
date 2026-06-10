import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const genre = searchParams.get('genre')
  const statut = searchParams.get('statut')
  const slug = searchParams.get('slug')
  const categorie = searchParams.get('categorie')
  const collectionSlug = searchParams.get('collection')

  try {
    const conditions: string[] = ['p.actif=1']
    const vals: (string | null)[] = []

    if (genre) { conditions.push('p.genre=?'); vals.push(genre.toUpperCase()) }
    if (statut) { conditions.push('p.statut=?'); vals.push(statut.toUpperCase()) }
    if (slug) { conditions.push('p.slug=?'); vals.push(slug) }
    if (categorie) { conditions.push('p.categorie=?'); vals.push(categorie) }
    if (collectionSlug) { conditions.push('c.slug=?'); vals.push(collectionSlug) }

    const [produits] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, c.id AS cId, c.slug AS cSlug, c.nom AS cNom
       FROM produits p
       LEFT JOIN collections c ON c.id = p.collectionId
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.createdAt DESC`,
      vals
    )

    if (produits.length === 0) return NextResponse.json({ produits: [], total: 0 })

    const ids = produits.map(p => p.id)
    const ph = ids.map(() => '?').join(',')
    const [images] = await pool.execute<RowDataPacket[]>(`SELECT * FROM produit_images WHERE produitId IN (${ph}) ORDER BY ordre ASC`, ids)
    const [tailles] = await pool.execute<RowDataPacket[]>(`SELECT * FROM produit_tailles WHERE produitId IN (${ph}) ORDER BY label ASC`, ids)

    const result = produits.map(p => ({
      ...p,
      actif: Boolean(p.actif),
      images: images.filter(i => i.produitId === p.id),
      tailles: tailles.filter(t => t.produitId === p.id),
      collection: p.collectionId ? { id: p.cId, slug: p.cSlug, nom: p.cNom } : null,
    }))

    return NextResponse.json({ produits: result, total: result.length })
  } catch (error) {
    console.error('[GET /api/produits]', error)
    return NextResponse.json({ produits: [], total: 0, error: 'DB indisponible' })
  }
}
