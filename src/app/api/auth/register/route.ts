/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur.
 * Body: { prenom, nom, email?, telephone?, motDePasse }
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, SESSION_COOKIE } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { prenom, nom, email, telephone, motDePasse } = await req.json()

    /* Validation */
    if (!prenom || !nom || !motDePasse) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }
    if (!email && !telephone) {
      return NextResponse.json({ error: 'Email ou téléphone requis.' }, { status: 400 })
    }
    if (motDePasse.length < 8) {
      return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min).' }, { status: 400 })
    }

    /* Vérifier si le compte existe déjà */
    const existant = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase() } : {},
          telephone ? { telephone } : {},
        ],
      },
    })
    if (existant) {
      return NextResponse.json({ error: 'Ce compte existe déjà.' }, { status: 409 })
    }

    /* Hash du mot de passe */
    const hash = await bcrypt.hash(motDePasse, 12)

    /* Création */
    const user = await prisma.utilisateur.create({
      data: {
        prenom,
        nom,
        email: email ? email.toLowerCase() : null,
        telephone: telephone ?? null,
        motDePasse: hash,
        role: 'CLIENT',
      },
    })

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
      message: 'Compte créé avec succès.',
      user: { id: user.id, prenom: user.prenom, nom: user.nom, role: user.role },
    }, { status: 201 })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    return response

  } catch (error) {
    console.error('[/api/auth/register]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
