/**
 * GET /api/admin/stats — KPIs réels pour le tableau de bord admin
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

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

  try {
    const now = new Date()
    const debut30j = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const debut60j = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      totalCommandes,
      commandesMois,
      commandesMoisPrec,
      chiffreAffaires,
      caMoisPrec,
      clientsActifs,
      clientsMoisPrec,
      totalProduits,
    ] = await Promise.all([
      prisma.commande.count(),
      prisma.commande.count({ where: { createdAt: { gte: debut30j } } }),
      prisma.commande.count({ where: { createdAt: { gte: debut60j, lt: debut30j } } }),
      prisma.commande.aggregate({
        _sum: { montantTotal: true },
        where: { statut: { not: 'ANNULE' } },
      }),
      prisma.commande.aggregate({
        _sum: { montantTotal: true },
        where: { statut: { not: 'ANNULE' }, createdAt: { gte: debut60j, lt: debut30j } },
      }),
      prisma.utilisateur.count({ where: { actif: true, role: 'CLIENT' } }),
      prisma.utilisateur.count({ where: { actif: true, role: 'CLIENT', createdAt: { gte: debut60j, lt: debut30j } } }),
      prisma.produit.count({ where: { actif: true } }),
    ])

    const ca = chiffreAffaires._sum.montantTotal ?? 0
    const caPrev = caMoisPrec._sum.montantTotal ?? 0

    const pctCommandes = commandesMoisPrec > 0
      ? (((commandesMois - commandesMoisPrec) / commandesMoisPrec) * 100).toFixed(1)
      : commandesMois > 0 ? '+100' : '0'

    const pctCA = caPrev > 0
      ? (((ca - caPrev) / caPrev) * 100).toFixed(1)
      : ca > 0 ? '+100' : '0'

    const pctClients = clientsMoisPrec > 0
      ? (((clientsActifs - clientsMoisPrec) / clientsMoisPrec) * 100).toFixed(1)
      : clientsActifs > 0 ? '+100' : '0'

    // Taux de conversion : commandes payées / total visites (on approxime avec commandes/clients)
    const commandesPaye = await prisma.commande.count({ where: { statut: 'PAYE' } })
    const tauxConversion = clientsActifs > 0 ? ((commandesPaye / clientsActifs) * 100).toFixed(1) : '0'

    return NextResponse.json({
      ca: { valeur: ca, pct: pctCA },
      commandes: { valeur: totalCommandes, mois: commandesMois, pct: pctCommandes },
      clients: { valeur: clientsActifs, pct: pctClients },
      conversion: { valeur: parseFloat(tauxConversion) },
      produits: { valeur: totalProduits },
    })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
