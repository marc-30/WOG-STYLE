import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { sendStatutCommandeEmail } from '@/lib/email'

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
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT statut, reference, utilisateurId FROM commandes WHERE id=?', [id])
    if (!existing[0]) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
    const statutChange = existing[0].statut !== statut

    await pool.execute('UPDATE commandes SET statut=? WHERE id=?', [statut, id])
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM commandes WHERE id=?', [id])

    if (statutChange) {
      const [userRows] = await pool.execute<RowDataPacket[]>(
        'SELECT prenom, nom, email FROM utilisateurs WHERE id=?', [existing[0].utilisateurId]
      )
      const utilisateur = userRows[0]
      if (utilisateur) {
        await sendStatutCommandeEmail({
          reference: existing[0].reference,
          client: { prenom: utilisateur.prenom, nom: utilisateur.nom, email: utilisateur.email },
          statut,
        })
      }
    }

    return NextResponse.json({ commande: rows[0] })
  } catch (error) {
    console.error('[PATCH /api/admin/commandes]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
