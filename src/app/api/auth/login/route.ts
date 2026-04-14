/**
 * POST /api/auth/login
 * Connexion — identifiant = email ou téléphone.
 * Body: { identifiant, motDePasse }
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, SESSION_COOKIE } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { identifiant, motDePasse } = await req.json()

    if (!identifiant || !motDePasse) {
      return NextResponse.json({ error: 'Identifiant et mot de passe requis.' }, { status: 400 })
    }

    /* Recherche par email ou téléphone */
    const isEmail = identifiant.includes('@')
    const user = await prisma.utilisateur.findFirst({
      where: isEmail
        ? { email: identifiant.toLowerCase() }
        : { telephone: identifiant },
    })

    if (!user || !user.actif) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 })
    }

    /* Vérification mot de passe */
    const ok = await bcrypt.compare(motDePasse, user.motDePasse)
    if (!ok) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 })
    }

    /* JWT + cookie */
    const token = signToken({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email ?? undefined,
      telephone: user.telephone ?? undefined,
      role: user.role,
    })

    const response = NextResponse.json({
      message: 'Connexion réussie.',
      user: { id: user.id, prenom: user.prenom, nom: user.nom, role: user.role },
    })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('[/api/auth/login]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
