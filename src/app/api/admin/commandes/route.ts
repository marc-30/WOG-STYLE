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

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '10') || 10, 1), 500)
  try {
    // LIMIT en paramètre préparé échoue avec mysql2 (ER_WRONG_ARGUMENTS) — interpolation
    // sûre ici car `limit` est un entier borné ci-dessus, jamais une valeur brute de l'utilisateur.
    const [commandes] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, u.prenom, u.nom, u.email
       FROM commandes c
       JOIN utilisateurs u ON u.id = c.utilisateurId
       ORDER BY c.createdAt DESC
       LIMIT ${limit}`
    )
    const [lignes] = await pool.execute<RowDataPacket[]>(
      `SELECT cl.*, p.nom AS produitNom, pi.url AS produitImage
       FROM commande_lignes cl
       JOIN produits p ON p.id = cl.produitId
       LEFT JOIN produit_images pi ON pi.produitId = cl.produitId AND pi.ordre = 0
       WHERE cl.commandeId IN (${commandes.map(() => '?').join(',') || "''"})`,
      commandes.map((c: RowDataPacket) => c.id)
    )
    const result = commandes.map((c: RowDataPacket) => ({
      ...c,
      utilisateur: { prenom: c.prenom, nom: c.nom, email: c.email },
      lignes: lignes.filter((l: RowDataPacket) => l.commandeId === c.id).map((l: RowDataPacket) => ({
        ...l,
        produit: { nom: l.produitNom, images: l.produitImage ? [{ url: l.produitImage }] : [] },
      })),
    }))
    return NextResponse.json({ commandes: result })
  } catch (error) {
    console.error('[GET /api/admin/commandes]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    const { id, statut } = await req.json()
    await pool.execute('UPDATE commandes SET statut=? WHERE id=?', [statut, id])
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM commandes WHERE id=?', [id])
    return NextResponse.json({ commande: rows[0] })
  } catch (error) {
    console.error('[PATCH /api/admin/commandes]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
