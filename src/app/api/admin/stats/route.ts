import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const now = new Date()
    const debut30j = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const debut60j = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      [r1], [r2], [r3], [r4], [r5], [r6], [r7], [r8], [r9]
    ] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM commandes'),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM commandes WHERE createdAt >= ?', [debut30j]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM commandes WHERE createdAt >= ? AND createdAt < ?', [debut60j, debut30j]),
      pool.execute<RowDataPacket[]>("SELECT COALESCE(SUM(montantTotal),0) AS total FROM commandes WHERE statut != 'ANNULE'"),
      pool.execute<RowDataPacket[]>("SELECT COALESCE(SUM(montantTotal),0) AS total FROM commandes WHERE statut != 'ANNULE' AND createdAt >= ? AND createdAt < ?", [debut60j, debut30j]),
      pool.execute<RowDataPacket[]>("SELECT COUNT(*) AS cnt FROM utilisateurs WHERE actif=1 AND role='CLIENT'"),
      pool.execute<RowDataPacket[]>("SELECT COUNT(*) AS cnt FROM utilisateurs WHERE actif=1 AND role='CLIENT' AND createdAt >= ? AND createdAt < ?", [debut60j, debut30j]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM produits WHERE actif=1'),
      pool.execute<RowDataPacket[]>("SELECT COUNT(*) AS cnt FROM commandes WHERE statut='PAYE'"),
    ])

    const tc = Number(r1[0].cnt), cm = Number(r2[0].cnt), cmp = Number(r3[0].cnt)
    const ca = Number(r4[0].total), caPrev = Number(r5[0].total)
    const clients = Number(r6[0].cnt), clientsPrev = Number(r7[0].cnt)
    const produits = Number(r8[0].cnt), paye = Number(r9[0].cnt)

    const pctCommandes = cmp > 0 ? (((cm - cmp) / cmp) * 100).toFixed(1) : cm > 0 ? '+100' : '0'
    const pctCA = caPrev > 0 ? (((ca - caPrev) / caPrev) * 100).toFixed(1) : ca > 0 ? '+100' : '0'
    const pctClients = clientsPrev > 0 ? (((clients - clientsPrev) / clientsPrev) * 100).toFixed(1) : clients > 0 ? '+100' : '0'
    const tauxConversion = clients > 0 ? ((paye / clients) * 100).toFixed(1) : '0'

    return NextResponse.json({
      ca: { valeur: ca, pct: pctCA },
      commandes: { valeur: tc, mois: cm, pct: pctCommandes },
      clients: { valeur: clients, pct: pctClients },
      conversion: { valeur: parseFloat(tauxConversion) },
      produits: { valeur: produits },
    })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
