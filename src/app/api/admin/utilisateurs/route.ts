/**
 * GET  /api/admin/utilisateurs  — Liste tous les utilisateurs (ADMIN only)
 * POST /api/admin/utilisateurs  — Crée un nouvel utilisateur (ADMIN only)
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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
    const utilisateurs = await prisma.utilisateur.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
        _count: { select: { commandes: true } },
      },
    })
    return NextResponse.json({ users: utilisateurs })
  } catch (error) {
    console.error('[GET /api/admin/utilisateurs]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { prenom, nom, email, telephone, motDePasse, role } = await req.json()

    if (!prenom || !nom || !motDePasse) {
      return NextResponse.json({ error: 'Prénom, nom et mot de passe requis.' }, { status: 400 })
    }
    if (!email && !telephone) {
      return NextResponse.json({ error: 'Email ou téléphone requis.' }, { status: 400 })
    }

    // Vérifier unicité email
    if (email) {
      const existing = await prisma.utilisateur.findFirst({ where: { email: email.toLowerCase() } })
      if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }
    // Vérifier unicité téléphone
    if (telephone) {
      const existing = await prisma.utilisateur.findFirst({ where: { telephone } })
      if (existing) return NextResponse.json({ error: 'Ce numéro est déjà utilisé.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(motDePasse, 12)

    const user = await prisma.utilisateur.create({
      data: {
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email ? email.toLowerCase().trim() : null,
        telephone: telephone ? telephone.trim() : null,
        motDePasse: hash,
        role: role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
        actif: true,
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/utilisateurs]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
