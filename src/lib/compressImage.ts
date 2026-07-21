/** Redimensionne (max 1600px de large) et compresse une image côté client (Canvas API, JPEG 85%). */
export const compressImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        const MAX_W = 1600
        let w = img.width, h = img.height
        if (w > MAX_W) { h = Math.round((h * MAX_W) / w); w = MAX_W }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression échouée')), 'image/jpeg', 0.85)
      }
      img.onerror = reject
      img.src = ev.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/** Compresse puis envoie une image vers /api/admin/upload (Vercel Blob), retourne l'URL publique. */
export const uploadCompressedImage = async (file: File, folder: string): Promise<string> => {
  const compressed = await compressImage(file)
  const body = new FormData()
  body.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'))
  body.append('folder', folder)

  const res = await fetch('/api/admin/upload', { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Impossible de téléverser l\'image.')
  return data.url as string
}
