/**
 * POST /api/admin/upload — Upload d'image produit
 * Sauvegarde dans /public/uploads/products/ (local) ou Supabase Storage (prod).
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
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo).' }, { status: 400 })
    }

    const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Supabase Storage (si configuré)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (SUPABASE_URL && SUPABASE_KEY) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/wog-produits/${filename}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: buffer,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.text()
        console.error('[upload Supabase]', err)
        return NextResponse.json({ error: 'Erreur upload Supabase.' }, { status: 500 })
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/wog-produits/${filename}`
      return NextResponse.json({ url: publicUrl })
    }

    // Fallback local (développement)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadsDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadsDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/products/${filename}` })

  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload.' }, { status: 500 })
  }
}
