/**
 * POST /api/admin/upload — Upload d'image produit
 * Ordre de priorité :
 *   1. Supabase Storage (si NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY configurés)
 *   2. Filesystem local — public/uploads/products/ (développement)
 *   3. Filesystem /tmp + réponse base64 (Vercel fallback)
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
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

    // ── 1. Supabase Storage ─────────────────────────────────────
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const uploadRes = await fetch(
          `${SUPABASE_URL}/storage/v1/object/wog-images/${filename}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': file.type,
              'x-upsert': 'true',
            },
            body: buffer,
          }
        )

        if (uploadRes.ok) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/wog-images/${filename}`
          return NextResponse.json({ url: publicUrl })
        }

        const errText = await uploadRes.text()
        console.error('[upload Supabase]', uploadRes.status, errText)
        // On continue vers le fallback local si Supabase échoue
      } catch (supaErr) {
        console.error('[upload Supabase network]', supaErr)
        // Continue vers fallback local
      }
    }

    // ── 2. Filesystem local — public/uploads/products/ ──────────
    const publicDir = path.join(process.cwd(), 'public')
    const uploadsDir = path.join(publicDir, 'uploads', 'products')

    try {
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(path.join(uploadsDir, filename), buffer)
      return NextResponse.json({ url: `/uploads/products/${filename}` })
    } catch (fsErr: unknown) {
      const msg = fsErr instanceof Error ? fsErr.message : String(fsErr)
      console.warn('[upload local filesystem]', msg)
      // Sur Vercel le filesystem public/ est read-only → fallback /tmp
    }

    // ── 3. Fallback /tmp (Vercel) + data URL ────────────────────
    try {
      const tmpDir = path.join('/tmp', 'wog-uploads')
      await mkdir(tmpDir, { recursive: true })
      await writeFile(path.join(tmpDir, filename), buffer)
    } catch {
      // ignore
    }

    // Retourner une data URL (solution de secours — pas de persistance entre déploiements)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    return NextResponse.json({
      url: dataUrl,
      warning: 'Image stockée temporairement (data URL). Configurez Supabase Storage pour la persistance.'
    })

  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload. Réessayez.' }, { status: 500 })
  }
}
