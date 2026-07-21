'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { uploadCompressedImage } from '@/lib/compressImage'

interface Collection {
  id: string
  nom: string
  tagline: string | null
}

interface SousCollectionImage { id: string; url: string; legende: string | null; ordre: number }
interface SousCollection {
  id: string; slug: string; nom: string; couleur: string
  description: string | null; citation: string | null
  images: SousCollectionImage[]
}

type ModalMode = 'create' | 'edit'

function emptyForm() {
  return { nom: '', couleur: '#000000', description: '', citation: '', images: [] as string[] }
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400'

export default function AdminCollectionSousCollectionsPage({ params }: { params: { id: string } }) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [sousCollections, setSousCollections] = useState<SousCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; sc: SousCollection | null }>({
    open: false, mode: 'create', sc: null,
  })
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')
  const fileRef = useRef<HTMLInputElement>(null)

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 5000)
  }

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      fetch(`/api/admin/collections/${params.id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/collections/${params.id}/sous-collections`).then(r => r.ok ? r.json() : { sousCollections: [] }),
    ])
      .then(([col, sc]) => {
        setCollection(col?.collection ?? null)
        setSousCollections(sc.sousCollections ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [params.id])

  const openCreate = () => {
    setForm(emptyForm())
    setModal({ open: true, mode: 'create', sc: null })
  }

  const openEdit = (sc: SousCollection) => {
    setForm({
      nom: sc.nom, couleur: sc.couleur, description: sc.description ?? '',
      citation: sc.citation ?? '', images: sc.images.map(i => i.url),
    })
    setModal({ open: true, mode: 'edit', sc })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 6 - form.images.length
    if (remaining <= 0) { showMsg('Maximum 6 images par sous-collection.', 'err'); return }
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of files.slice(0, remaining)) {
        if (!file.type.startsWith('image/')) { showMsg('Format non supporté. Utilisez JPG, PNG ou WebP.', 'err'); continue }
        if (file.size > 15 * 1024 * 1024) { showMsg('Fichier trop volumineux (max 15 Mo).', 'err'); continue }
        try {
          urls.push(await uploadCompressedImage(file, 'collections/sous-collections'))
        } catch (err) {
          showMsg(err instanceof Error ? err.message : 'Impossible de téléverser l\'image.', 'err')
        }
      }
      if (urls.length > 0) setForm(f => ({ ...f, images: [...f.images, ...urls].slice(0, 6) }))
    } catch (error) {
      showMsg('Erreur lors du chargement des images.', 'err')
      console.error(error)
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) { showMsg('Le nom est obligatoire.', 'err'); return }
    if (form.images.length === 0) { showMsg('Au moins une image est obligatoire.', 'err'); return }
    setSaving(true)
    try {
      const url = modal.mode === 'edit'
        ? `/api/admin/collections/${params.id}/sous-collections/${modal.sc!.id}`
        : `/api/admin/collections/${params.id}/sous-collections`
      const method = modal.mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom.trim(),
          couleur: form.couleur,
          description: form.description || null,
          citation: form.citation || null,
          images: form.images,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        showMsg(modal.mode === 'edit' ? 'Sous-collection modifiée.' : 'Sous-collection créée.')
        setModal({ open: false, mode: 'create', sc: null })
        fetchAll()
      } else {
        showMsg(data.error || 'Erreur.', 'err')
      }
    } catch { showMsg('Erreur réseau.', 'err') }
    setSaving(false)
  }

  const handleDelete = async (sc: SousCollection) => {
    if (!confirm(`Supprimer la sous-collection "${sc.nom}" ?`)) return
    const res = await fetch(`/api/admin/collections/${params.id}/sous-collections/${sc.id}`, { method: 'DELETE' })
    if (res.ok) { showMsg('Sous-collection supprimée.'); fetchAll() }
    else showMsg('Erreur de suppression.', 'err')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Collection introuvable.</p>
        <Link href="/admin/collections" className="mt-3 inline-block text-theme-xs text-brand-600 hover:underline">
          ← Retour aux collections
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link href="/admin/collections" className="text-theme-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          ← Collections
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">{collection.nom} — Sous-collections</h1>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              {sousCollections.length} sous-collection{sousCollections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Nouvelle sous-collection
          </button>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-theme-sm font-medium ${msgType === 'ok' ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400' : 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400'}`}>
          {msg}
        </div>
      )}

      {/* Liste */}
      {sousCollections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aucune sous-collection. Cliquez sur « Nouvelle sous-collection » pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sousCollections.map(sc => (
            <div key={sc.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                {sc.images[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={sc.images[0].url} alt={sc.nom} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: sc.couleur }} />
              </div>
              <div className="p-4">
                <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">{sc.nom}</p>
                {sc.description && <p className="text-theme-xs text-gray-400 line-clamp-2 mt-1">{sc.description}</p>}
                <p className="text-theme-xs text-gray-400 mt-1">{sc.images.length} image{sc.images.length !== 1 ? 's' : ''}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(sc)}
                    className="flex-1 rounded-lg border border-brand-200 py-1.5 text-theme-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(sc)}
                    className="flex-1 rounded-lg border border-error-200 py-1.5 text-theme-xs font-medium text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL Créer / Modifier */}
      {modal.open && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {modal.mode === 'create' ? 'Nouvelle sous-collection' : `Modifier : ${modal.sc?.nom}`}
              </h3>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Images */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images <span className="text-error-500 font-semibold">*</span>
                  <span className="text-gray-400 font-normal ml-1">({form.images.length}/6)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <label className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors ${uploading || form.images.length >= 6 ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <svg className="animate-spin w-5 h-5 text-brand-500" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-400 mb-1">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span className="text-[10px] text-gray-400">Ajouter</span>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  </label>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP · max 5 Mo chacune.</p>
              </div>

              {/* Nom + couleur */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                  <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    required className={inputCls} placeholder="BOGOLAN, AURA VERTE..." />
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur</label>
                  <input type="color" value={form.couleur} onChange={e => setForm(f => ({ ...f, couleur: e.target.value }))}
                    className="h-[38px] w-14 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className={`${inputCls} resize-none`} placeholder="Description éditoriale de la sous-collection..." />
              </div>

              {/* Citation */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Citation <span className="text-gray-400 font-normal">(optionnelle)</span>
                </label>
                <textarea value={form.citation} onChange={e => setForm(f => ({ ...f, citation: e.target.value }))}
                  rows={2} className={`${inputCls} resize-none`} placeholder="Une citation éditoriale mise en avant..." />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button type="submit" disabled={saving || form.images.length === 0}
                  className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors">
                  {saving ? 'Enregistrement...' : modal.mode === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setModal(m => ({ ...m, open: false }))}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
