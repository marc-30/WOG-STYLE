import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'

export const runtime = 'nodejs'

/** Sans BLOB_READ_WRITE_TOKEN (dev local sans store Blob branché), on écrit sur le disque local. */
async function uploadLocal(file: File, filename: string): Promise<string> {
  const dest = join(process.cwd(), 'public', 'uploads', filename)
  await mkdir(join(dest, '..'), { recursive: true })
  await writeFile(dest, Buffer.from(await file.arrayBuffer()))
  return `/uploads/${filename}`
}

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
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier image trouvé.' }, { status: 400 })
    }

    const folder = formData.get('folder')?.toString() || 'produits'
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const url = await uploadLocal(file, filename)
      return NextResponse.json({ url })
    }

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: 'Erreur serveur lors du téléversement.' }, { status: 500 })
  }
}
