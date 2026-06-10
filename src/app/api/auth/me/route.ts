import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ user: null }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ user: null }, { status: 401 })

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.role, u.createdAt,
              (SELECT COUNT(*) FROM commandes c WHERE c.utilisateurId = u.id) AS _countCommandes
       FROM utilisateurs u WHERE u.id = ? LIMIT 1`,
      [payload.id]
    )
    const user = rows[0]
    if (!user) return NextResponse.json({ user: null }, { status: 401 })

    return NextResponse.json({
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        createdAt: user.createdAt,
        _count: { commandes: Number(user._countCommandes) },
      },
    })
  } catch (error) {
    console.error('[/api/auth/me]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
