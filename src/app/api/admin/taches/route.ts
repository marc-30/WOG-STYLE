/**
 * GET  /api/admin/taches — Liste toutes les tâches (ADMIN only)
 * POST /api/admin/taches — Crée une tâche
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

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
    const taches = await prisma.tache.findMany({
      orderBy: [{ statut: 'asc' }, { priorite: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ taches })
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

    const tache = await prisma.tache.create({
      data: {
        titre: titre.trim(),
        description: description?.trim() || null,
        priorite: priorite ?? 'MOYENNE',
        statut: statut ?? 'A_FAIRE',
        echeance: echeance ? new Date(echeance) : null,
        assignee: assignee?.trim() || null,
      },
    })
    return NextResponse.json({ tache }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/taches]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
