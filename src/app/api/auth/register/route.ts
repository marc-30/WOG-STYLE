import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import { signToken, SESSION_COOKIE } from '@/lib/jwt'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { prenom, nom, email, telephone, motDePasse } = await req.json()

    if (!prenom || !nom || !motDePasse) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }
    if (!email && !telephone) {
      return NextResponse.json({ error: 'Email ou téléphone requis.' }, { status: 400 })
    }
    if (motDePasse.length < 8) {
      return NextResponse.json({ error: 'Mot de passe trop court (8 caractères min).' }, { status: 400 })
    }

    if (email) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM utilisateurs WHERE email = ? LIMIT 1',
        [email.toLowerCase()]
      )
      if (rows.length > 0) return NextResponse.json({ error: 'Ce compte existe déjà.' }, { status: 409 })
    }
    if (telephone) {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM utilisateurs WHERE telephone = ? LIMIT 1',
        [telephone]
      )
      if (rows.length > 0) return NextResponse.json({ error: 'Ce compte existe déjà.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(motDePasse, 12)
    const id = randomUUID()

    await pool.execute(
      `INSERT INTO utilisateurs (id, prenom, nom, email, telephone, motDePasse, role, actif)
       VALUES (?, ?, ?, ?, ?, ?, 'CLIENT', 1)`,
      [id, prenom, nom, email ? email.toLowerCase() : null, telephone ?? null, hash]
    )

    const token = signToken({
      id,
      prenom,
      nom,
      email: email ?? undefined,
      telephone: telephone ?? undefined,
      role: 'CLIENT',
    })

    const response = NextResponse.json(
      { message: 'Compte créé avec succès.', user: { id, prenom, nom, role: 'CLIENT' } },
      { status: 201 }
    )

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[/api/auth/register]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
