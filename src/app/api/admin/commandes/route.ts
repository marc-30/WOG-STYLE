/**
 * GET /api/admin/commandes — Liste des commandes récentes (ADMIN only)
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
  const limit = parseInt(searchParams.get('limit') ?? '10')

  try {
    const commandes = await prisma.commande.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: { select: { prenom: true, nom: true, email: true } },
        lignes: {
          include: { produit: { select: { nom: true, images: { take: 1, orderBy: { ordre: 'asc' } } } } },
        },
      },
    })

    return NextResponse.json({ commandes })
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
    const commande = await prisma.commande.update({
      where: { id },
      data: { statut },
    })
    return NextResponse.json({ commande })
  } catch (error) {
    console.error('[PATCH /api/admin/commandes]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
