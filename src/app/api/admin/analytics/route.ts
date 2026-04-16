/**
 * GET /api/admin/analytics — Données pour les graphiques (ventes par mois, top produits, etc.)
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

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? '6m'
  const months = period === '1y' ? 12 : 6

  try {
    const now = new Date()
    const labels: string[] = []
    const ventesData: number[] = []
    const commandesData: number[] = []

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

      const moisFR = d.toLocaleDateString('fr-FR', { month: 'short' })
      labels.push(moisFR.charAt(0).toUpperCase() + moisFR.slice(1))

      const [agg, cnt] = await Promise.all([
        prisma.commande.aggregate({
          _sum: { montantTotal: true },
          where: { createdAt: { gte: d, lte: fin }, statut: { not: 'ANNULE' } },
        }),
        prisma.commande.count({
          where: { createdAt: { gte: d, lte: fin } },
        }),
      ])

      ventesData.push(Math.round((agg._sum.montantTotal ?? 0) / 1000)) // en milliers XOF
      commandesData.push(cnt)
    }

    // Top 5 produits par ventes
    const topProduits = await prisma.ligneCommande.groupBy({
      by: ['produitId'],
      _sum: { quantite: true, prixUnitaire: true },
      orderBy: { _sum: { quantite: 'desc' } },
      take: 5,
    })

    const topProduitsDetails = await Promise.all(
      topProduits.map(async (tp) => {
        const prod = await prisma.produit.findUnique({
          where: { id: tp.produitId },
          select: { nom: true, images: { take: 1, orderBy: { ordre: 'asc' } } },
        })
        return {
          nom: prod?.nom ?? 'Produit supprimé',
          image: prod?.images[0]?.url ?? null,
          quantite: tp._sum.quantite ?? 0,
          ca: tp._sum.prixUnitaire ?? 0,
        }
      })
    )

    // Répartition par statut commande
    const statutStats = await prisma.commande.groupBy({
      by: ['statut'],
      _count: { id: true },
    })

    // Répartition par genre
    const genreStats = await prisma.ligneCommande.groupBy({
      by: ['produitId'],
      _sum: { quantite: true },
    })

    // Nouveaux clients sur les 6 derniers mois
    const nouveauxClients: number[] = []
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const cnt = await prisma.utilisateur.count({
        where: { createdAt: { gte: d, lte: fin }, role: 'CLIENT' },
      })
      nouveauxClients.push(cnt)
    }

    return NextResponse.json({
      labels,
      ventes: ventesData,
      commandes: commandesData,
      clients: nouveauxClients,
      topProduits: topProduitsDetails,
      statutStats: statutStats.map(s => ({ statut: s.statut, count: s._count.id })),
    })
  } catch (error) {
    console.error('[GET /api/admin/analytics]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
