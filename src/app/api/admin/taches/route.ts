import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { requireAdmin } from '@/lib/auth'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM taches ORDER BY FIELD(statut,'A_FAIRE','EN_COURS','TERMINE'), FIELD(priorite,'HAUTE','MOYENNE','BASSE'), createdAt DESC"
    )
    return NextResponse.json({ taches: rows })
  } catch (error) {
    console.error('[GET /api/admin/taches]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    const { titre, description, priorite, statut, echeance, assignee } = await req.json()
    if (!titre) return NextResponse.json({ error: 'Titre requis.' }, { status: 400 })
    const id = randomUUID()
    await pool.execute(
      'INSERT INTO taches (id, titre, description, priorite, statut, echeance, assignee) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, titre.trim(), description?.trim() || null, priorite ?? 'MOYENNE', statut ?? 'A_FAIRE', echeance ? new Date(echeance) : null, assignee?.trim() || null]
    )
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM taches WHERE id = ?', [id])
    return NextResponse.json({ tache: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/taches]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
