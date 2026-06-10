import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import pool from '@/lib/db'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const { id } = params
  try {
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT * FROM utilisateurs WHERE id=? LIMIT 1', [id])
    if (!existing[0]) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
    const body = await req.json()
    const { prenom, nom, email, telephone, role, actif, motDePasse } = body
    if (email && email.toLowerCase() !== existing[0].email) {
      const [c] = await pool.execute<RowDataPacket[]>('SELECT id FROM utilisateurs WHERE email=? AND id!=? LIMIT 1', [email.toLowerCase(), id])
      if (c.length > 0) return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }
    if (telephone && telephone !== existing[0].telephone) {
      const [c] = await pool.execute<RowDataPacket[]>('SELECT id FROM utilisateurs WHERE telephone=? AND id!=? LIMIT 1', [telephone, id])
      if (c.length > 0) return NextResponse.json({ error: 'Ce numéro est déjà utilisé.' }, { status: 409 })
    }
    const fields: string[] = []
    const vals: (string | number | boolean | null | Date)[] = []
    if (prenom !== undefined) { fields.push('prenom=?'); vals.push(prenom.trim()) }
    if (nom !== undefined) { fields.push('nom=?'); vals.push(nom.trim()) }
    if (email !== undefined) { fields.push('email=?'); vals.push(email ? email.toLowerCase().trim() : null) }
    if (telephone !== undefined) { fields.push('telephone=?'); vals.push(telephone ? telephone.trim() : null) }
    if (role !== undefined) { fields.push('role=?'); vals.push(role === 'ADMIN' ? 'ADMIN' : 'CLIENT') }
    if (actif !== undefined) { fields.push('actif=?'); vals.push(Boolean(actif) ? 1 : 0) }
    if (motDePasse) { fields.push('motDePasse=?'); vals.push(await bcrypt.hash(motDePasse, 12)) }
    if (fields.length > 0) { vals.push(id); await pool.execute(`UPDATE utilisateurs SET ${fields.join(', ')} WHERE id=?`, vals) }
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, prenom, nom, email, telephone, role, actif, createdAt FROM utilisateurs WHERE id=?', [id])
    return NextResponse.json({ user: rows[0] })
  } catch (error) {
    console.error('[PATCH /api/admin/utilisateurs/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const { id } = params
  if (id === admin.id) return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 403 })
  try {
    const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM utilisateurs WHERE id=? LIMIT 1', [id])
    if (!existing[0]) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
    await pool.execute('DELETE FROM utilisateurs WHERE id=?', [id])
    return NextResponse.json({ message: 'Utilisateur supprimé.' })
  } catch (error) {
    console.error('[DELETE /api/admin/utilisateurs/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
