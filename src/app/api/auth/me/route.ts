/**
 * GET /api/auth/me
 * Retourne l'utilisateur connecté depuis le cookie de session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        createdAt: true,
        _count: { select: { commandes: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('[/api/auth/me]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
