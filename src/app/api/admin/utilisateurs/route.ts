import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

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
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.role, u.actif, u.createdAt,
              COUNT(c.id) AS commandesCount
       FROM utilisateurs u
       LEFT JOIN commandes c ON c.utilisateurId = u.id
       GROUP BY u.id
       ORDER BY u.createdAt DESC`
    )
    const users = rows.map(u => ({
      ...u,
      actif: Boolean(u.actif),
      _count: { commandes: Number(u.commandesCount) },
    }))
    return NextResponse.json({ users })
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
    if (!prenom || !nom || !motDePasse) return NextResponse.json({ error: 'Prénom, nom et mot de passe requis.' }, { status: 400 })
    if (!email && !telephone) return NextResponse.json({ error: 'Email ou téléphone requis.' }, { status: 400 })
    if (email) {
      const [r] = await pool.execute<RowDataPacket[]>('SELECT id FROM utilisateurs WHERE email=? LIMIT 1', [email.toLowerCase()])
      if (r.length > 0) return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }
    if (telephone) {
      const [r] = await pool.execute<RowDataPacket[]>('SELECT id FROM utilisateurs WHERE telephone=? LIMIT 1', [telephone])
      if (r.length > 0) return NextResponse.json({ error: 'Ce numéro est déjà utilisé.' }, { status: 409 })
    }
    const hash = await bcrypt.hash(motDePasse, 12)
    const id = randomUUID()
    await pool.execute(
      'INSERT INTO utilisateurs (id, prenom, nom, email, telephone, motDePasse, role, actif) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [id, prenom.trim(), nom.trim(), email ? email.toLowerCase().trim() : null, telephone ? telephone.trim() : null, hash, role === 'ADMIN' ? 'ADMIN' : 'CLIENT']
    )
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, prenom, nom, email, telephone, role, actif, createdAt FROM utilisateurs WHERE id=?', [id])
    return NextResponse.json({ user: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/utilisateurs]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
