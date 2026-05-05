/**
 * POST /api/admin/upload — Upload d'image produit
 * - Local dev  : sauvegarde dans public/uploads/products/ (persistent)
 * - Production : sauvegarde dans public/uploads/products/ si possible,
 *                sinon retourne une data URL temporaire avec un avertissement.
 *
 * Pour activer le stockage cloud sur Vercel sans Supabase :
 *   npm install @vercel/blob
 *   Ajouter BLOB_READ_WRITE_TOKEN dans les variables d'environnement Vercel.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé. Reconnectez-vous en tant qu\'admin.' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `Format non supporté (${file.type}). Utilisez JPG, PNG ou WebP.`
      }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo, max 5 Mo).`
      }, { status: 400 })
    }

    const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // ── Filesystem local — public/uploads/products/ ─────────────────────────
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    try {
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(path.join(uploadsDir, filename), buffer)
      return NextResponse.json({ url: `/uploads/products/${filename}` })
    } catch (fsErr: unknown) {
      const msg = fsErr instanceof Error ? fsErr.message : String(fsErr)
      console.warn('[upload filesystem]', msg)
      // Sur Vercel, public/ est en lecture seule à l'exécution → data URL temporaire
    }

    // ── Fallback data URL (Vercel sans stockage cloud configuré) ────────────
    const base64 = buffer.toString('base64')
    return NextResponse.json({
      url: `data:${file.type};base64,${base64}`,
      warning: 'Image stockée temporairement (non persistante). Pour la persistance, configurez Vercel Blob Storage (BLOB_READ_WRITE_TOKEN).'
    })

  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload. Réessayez.' }, { status: 500 })
  }
}
