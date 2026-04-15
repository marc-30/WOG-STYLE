/**
 * PATCH  /api/admin/utilisateurs/[id]  — Modifie un utilisateur (ADMIN only)
 * DELETE /api/admin/utilisateurs/[id]  — Supprime un utilisateur (ADMIN only)
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id } = params
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 })

  try {
    const body = await req.json()
    const { prenom, nom, email, telephone, role, actif, motDePasse } = body

    // Vérifier que l'utilisateur existe
    const existing = await prisma.utilisateur.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })

    // Vérifier unicité email si changé
    if (email && email.toLowerCase() !== existing.email) {
      const conflict = await prisma.utilisateur.findFirst({
        where: { email: email.toLowerCase(), id: { not: id } },
      })
      if (conflict) return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }
    // Vérifier unicité téléphone si changé
    if (telephone && telephone !== existing.telephone) {
      const conflict = await prisma.utilisateur.findFirst({
        where: { telephone, id: { not: id } },
      })
      if (conflict) return NextResponse.json({ error: 'Ce numéro est déjà utilisé.' }, { status: 409 })
    }

    const updateData: Record<string, unknown> = {}
    if (prenom !== undefined) updateData.prenom = prenom.trim()
    if (nom !== undefined) updateData.nom = nom.trim()
    if (email !== undefined) updateData.email = email ? email.toLowerCase().trim() : null
    if (telephone !== undefined) updateData.telephone = telephone ? telephone.trim() : null
    if (role !== undefined) updateData.role = role === 'ADMIN' ? 'ADMIN' : 'CLIENT'
    if (actif !== undefined) updateData.actif = Boolean(actif)
    if (motDePasse) updateData.motDePasse = await bcrypt.hash(motDePasse, 12)

    const user = await prisma.utilisateur.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[PATCH /api/admin/utilisateurs/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id } = params
  if (!id) return NextResponse.json({ error: 'ID manquant.' }, { status: 400 })

  try {
    // Empêcher l'admin de se supprimer lui-même
    if (id === admin.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 403 })
    }

    const existing = await prisma.utilisateur.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })

    await prisma.utilisateur.delete({ where: { id } })

    return NextResponse.json({ message: 'Utilisateur supprimé.' })
  } catch (error) {
    console.error('[DELETE /api/admin/utilisateurs/[id]]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
