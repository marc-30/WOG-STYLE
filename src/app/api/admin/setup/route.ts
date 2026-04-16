/**
 * POST /api/admin/setup
 * Crée le premier compte ADMIN si aucun n'existe encore,
 * OU upgrade un utilisateur existant en ADMIN (avec la même logique).
 * Protégé par une clé secrète ADMIN_SETUP_KEY (env var).
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, SESSION_COOKIE } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { prenom, nom, email, telephone, motDePasse, setupKey } = await req.json()

    // Vérifier la clé secrète (définie dans .env)
    const SETUP_KEY = process.env.ADMIN_SETUP_KEY ?? 'wog-admin-setup-2026'
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json({ error: 'Clé de configuration incorrecte.' }, { status: 403 })
    }

    if (!motDePasse || (!email && !telephone)) {
      return NextResponse.json({ error: 'Email/téléphone et mot de passe requis.' }, { status: 400 })
    }

    // Chercher si un compte existe déjà avec cet email/téléphone
    const existing = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          email ? { email: email.toLowerCase() } : { id: '__none__' },
          telephone ? { telephone } : { id: '__none__' },
        ],
      },
    })

    let user
    if (existing) {
      // Upgrade en ADMIN
      user = await prisma.utilisateur.update({
        where: { id: existing.id },
        data: { role: 'ADMIN', actif: true },
      })
    } else {
      // Créer nouveau compte ADMIN
      if (!prenom || !nom) {
        return NextResponse.json({ error: 'Prénom et nom requis pour un nouveau compte.' }, { status: 400 })
      }
      const hash = await bcrypt.hash(motDePasse, 12)
      user = await prisma.utilisateur.create({
        data: {
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: email ? email.toLowerCase().trim() : null,
          telephone: telephone ? telephone.trim() : null,
          motDePasse: hash,
          role: 'ADMIN',
          actif: true,
        },
      })
    }

    // Émettre un nouveau JWT ADMIN
    const token = signToken({
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email ?? undefined,
      telephone: user.telephone ?? undefined,
      role: 'ADMIN',
    })

    const response = NextResponse.json({
      message: `Compte admin configuré pour ${user.prenom} ${user.nom}.`,
      user: { id: user.id, prenom: user.prenom, nom: user.nom, role: 'ADMIN' },
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
    console.error('[POST /api/admin/setup]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
