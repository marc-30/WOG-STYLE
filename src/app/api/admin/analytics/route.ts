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
  const period = searchParams.get('period') ?? '6m'
  const months = period === '1y' ? 12 : 6

  try {
    const now = new Date()
    const labels: string[] = []
    const ventesData: number[] = []
    const commandesData: number[] = []
    const nouveauxClients: number[] = []

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const moisFR = d.toLocaleDateString('fr-FR', { month: 'short' })
      labels.push(moisFR.charAt(0).toUpperCase() + moisFR.slice(1))

      const [[aggRows], [cntRows], [clientRows]] = await Promise.all([
        pool.execute<RowDataPacket[]>("SELECT COALESCE(SUM(montantTotal),0) AS total FROM commandes WHERE createdAt >= ? AND createdAt <= ? AND statut != 'ANNULE'", [d, fin]),
        pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM commandes WHERE createdAt >= ? AND createdAt <= ?', [d, fin]),
        pool.execute<RowDataPacket[]>("SELECT COUNT(*) AS cnt FROM utilisateurs WHERE createdAt >= ? AND createdAt <= ? AND role='CLIENT'", [d, fin]),
      ])
      ventesData.push(Math.round(Number(aggRows[0].total) / 1000))
      commandesData.push(Number(cntRows[0].cnt))
      nouveauxClients.push(Number(clientRows[0].cnt))
    }

    const [topRows] = await pool.execute<RowDataPacket[]>(
      `SELECT cl.produitId, SUM(cl.quantite) AS totalQty, SUM(cl.prixUnitaire) AS totalCA,
              p.nom, pi.url AS image
       FROM commande_lignes cl
       JOIN produits p ON p.id = cl.produitId
       LEFT JOIN produit_images pi ON pi.produitId = cl.produitId AND pi.ordre = 0
       GROUP BY cl.produitId, p.nom, pi.url
       ORDER BY totalQty DESC
       LIMIT 5`
    )
    const topProduits = topRows.map(r => ({
      nom: r.nom,
      image: r.image ?? null,
      quantite: Number(r.totalQty),
      ca: Number(r.totalCA),
    }))

    const [statutRows] = await pool.execute<RowDataPacket[]>(
      'SELECT statut, COUNT(*) AS cnt FROM commandes GROUP BY statut'
    )
    const statutStats = statutRows.map(r => ({ statut: r.statut, count: Number(r.cnt) }))

    return NextResponse.json({
      labels, ventes: ventesData, commandes: commandesData,
      clients: nouveauxClients, topProduits, statutStats,
    })
  } catch (error) {
    console.error('[GET /api/admin/analytics]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
