import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'
import pool from '@/lib/db'
import { signToken, SESSION_COOKIE } from '@/lib/jwt'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { prenom, nom, email, telephone, motDePasse, setupKey } = await req.json()

    const SETUP_KEY = process.env.ADMIN_SETUP_KEY ?? 'wog-admin-setup-2026'
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json({ error: 'Clé de configuration incorrecte.' }, { status: 403 })
    }
    if (!motDePasse || (!email && !telephone)) {
      return NextResponse.json({ error: 'Email/téléphone et mot de passe requis.' }, { status: 400 })
    }

    const conditions: string[] = []
    const condVals: (string | null)[] = []
    if (email) { conditions.push('email=?'); condVals.push(email.toLowerCase()) }
    if (telephone) { conditions.push('telephone=?'); condVals.push(telephone) }

    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM utilisateurs WHERE ${conditions.join(' OR ')} LIMIT 1`, condVals
    )

    let user: RowDataPacket
    if (existing[0]) {
      await pool.execute('UPDATE utilisateurs SET role=?, actif=1 WHERE id=?', ['ADMIN', existing[0].id])
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM utilisateurs WHERE id=?', [existing[0].id])
      user = rows[0]
    } else {
      if (!prenom || !nom) {
        return NextResponse.json({ error: 'Prénom et nom requis pour un nouveau compte.' }, { status: 400 })
      }
      const hash = await bcrypt.hash(motDePasse, 12)
      const id = randomUUID()
      await pool.execute(
        'INSERT INTO utilisateurs (id, prenom, nom, email, telephone, motDePasse, role, actif) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [id, prenom.trim(), nom.trim(), email ? email.toLowerCase().trim() : null, telephone ? telephone.trim() : null, hash, 'ADMIN']
      )
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM utilisateurs WHERE id=?', [id])
      user = rows[0]
    }

    const token = signToken({
      id: user.id, prenom: user.prenom, nom: user.nom,
      email: user.email ?? undefined, telephone: user.telephone ?? undefined, role: 'ADMIN',
    })

    const response = NextResponse.json({
      message: `Compte admin configuré pour ${user.prenom} ${user.nom}.`,
      user: { id: user.id, prenom: user.prenom, nom: user.nom, role: 'ADMIN' },
    })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    })
    return response
  } catch (error) {
    console.error('[POST /api/admin/setup]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
