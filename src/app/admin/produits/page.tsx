'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Badge from '../_components/Badge'

interface ProduitImage { id?: string; url: string; ordre: number; isHover: boolean }
interface ProduitTaille { id?: string; label: string; stock: number; disponible: boolean }
interface CollectionItem { id: string; slug: string; nom: string }
interface Produit {
  id: string; slug: string; nom: string; description: string | null
  prix: number; prixOriginal: number | null; marque: string
  genre: 'HOMME' | 'FEMME' | 'UNISEXE'; statut: 'STANDARD' | 'NEW' | 'EXCLUSIVE' | 'SALE'
  stock: number; actif: boolean; categorie: string; createdAt: string
  collectionId: string | null; collection?: CollectionItem | null
  images: ProduitImage[]; tailles: ProduitTaille[]
  _count?: { lignesCommande: number }
}

type ModalMode = 'create' | 'edit'

const GENRE_BADGE: Record<string, 'primary' | 'info' | 'light'> = { HOMME: 'primary', FEMME: 'info', UNISEXE: 'light' }
const STATUT_BADGE: Record<string, 'success' | 'warning' | 'error' | 'light'> = { NEW: 'success', EXCLUSIVE: 'warning', SALE: 'error', STANDARD: 'light' }
const TAILLES_DEFAULT = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function emptyForm() {
  return {
    nom: '', slug: '', description: '', prix: '', prixOriginal: '',
    marque: 'WOG Style', genre: 'UNISEXE', statut: 'STANDARD', stock: '0', actif: true,
    categorie: 'vetements', collectionId: '',
    images: [] as string[], tailles: TAILLES_DEFAULT.map(l => ({ label: l, stock: 0, disponible: true })),
  }
}

export default function AdminProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; produit: Produit | null }>({ open: false, mode: 'create', produit: null })
  const [form, setForm] = useState(emptyForm())
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')
  const [seeding, setSeeding] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchProduits = () => {
    setLoading(true)
    fetch('/api/admin/produits')
      .then(r => r.ok ? r.json() : { produits: [] })
      .then(d => setProduits(d.produits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProduits()
    fetch('/api/admin/collections')
      .then(r => r.ok ? r.json() : { collections: [] })
      .then(d => setCollections(d.collections ?? []))
      .catch(() => {})
  }, [])

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 5000)
  }

  const openCreate = () => {
    setForm(emptyForm())
    setModal({ open: true, mode: 'create', produit: null })
  }

  const openEdit = (p: Produit) => {
    setForm({
      nom: p.nom, slug: p.slug, description: p.description ?? '',
      prix: String(p.prix), prixOriginal: p.prixOriginal ? String(p.prixOriginal) : '',
      marque: p.marque, genre: p.genre, statut: p.statut,
      stock: String(p.stock), actif: p.actif,
      categorie: p.categorie ?? 'vetements',
      collectionId: p.collectionId ?? '',
      images: p.images.map(i => i.url),
      tailles: p.tailles.length > 0
        ? p.tailles.map(t => ({ label: t.label, stock: t.stock, disponible: t.disponible }))
        : TAILLES_DEFAULT.map(l => ({ label: l, stock: p.stock, disponible: true })),
    })
    setModal({ open: true, mode: 'edit', produit: p })
  }

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const img = new window.Image()
        img.onload = () => {
          const MAX_W = 1200
          let w = img.width, h = img.height
          if (w > MAX_W) { h = Math.round((h * MAX_W) / w); w = MAX_W }
          const canvas = document.createElement('canvas')
          canvas.width = w; canvas.height = h
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.82))
        }
        img.onerror = reject
        img.src = ev.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 4 - form.images.length
    if (remaining <= 0) { showMsg('Maximum 4 images par produit.', 'err'); return }
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of files.slice(0, remaining)) {
        if (!file.type.startsWith('image/')) { showMsg('Format non supporté. Utilisez JPG, PNG ou WebP.', 'err'); continue }
        if (file.size > 15 * 1024 * 1024) { showMsg('Fichier trop volumineux (max 15 Mo).', 'err'); continue }
        const b64 = await compressImage(file)
        urls.push(b64)
      }
      if (urls.length > 0) setForm(f => ({ ...f, images: [...f.images, ...urls].slice(0, 4) }))
    } catch {
      showMsg("Erreur lors du chargement des images.", 'err')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const autoSlug = (nom: string) => nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom || !form.prix) { showMsg('Nom et prix obligatoires.', 'err'); return }
    if (form.images.length === 0) { showMsg('Au moins une image est obligatoire.', 'err'); return }

    const slug = form.slug || autoSlug(form.nom)
    setSaving(true)
    try {
      const body = {
        nom: form.nom, slug, description: form.description || null,
        prix: form.prix, prixOriginal: form.prixOriginal || null,
        marque: form.marque, genre: form.genre, statut: form.statut,
        stock: form.stock, actif: form.actif,
        categorie: form.categorie || 'vetements',
        collectionId: form.collectionId || null,
        images: form.images, tailles: form.tailles,
      }

      const url = modal.mode === 'edit' ? `/api/admin/produits/${modal.produit!.id}` : '/api/admin/produits'
      const method = modal.mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showMsg(modal.mode === 'edit' ? 'Produit modifié.' : 'Produit créé.')
        setModal({ open: false, mode: 'create', produit: null })
        fetchProduits()
      } else {
        const d = await res.json().catch(() => ({}))
        showMsg(d.error || 'Erreur.', 'err')
      }
    } catch { showMsg('Erreur réseau.', 'err') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement ce produit ? Cette action est irréversible.')) return
    const res = await fetch(`/api/admin/produits/${id}`, { method: 'DELETE' })
    if (res.ok) { showMsg('Produit supprimé.'); fetchProduits() }
    else showMsg('Erreur de suppression.', 'err')
  }

  const handleSeed = async (force = false) => {
    if (force) {
      if (!confirm('⚠️ Réinitialisation complète : toutes les commandes et produits existants seront supprimés. Continuer ?')) return
    } else {
      if (!confirm('Initialiser la base avec les 18 produits WOG ? (collections EDEN + GENÈSE + Front)')) return
    }
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.ok) {
        showMsg(d.message || 'Produits initialisés avec succès.', 'ok')
        fetchProduits()
      } else {
        showMsg(d.error || d.message || `Erreur ${res.status}`, 'err')
      }
    } catch {
      showMsg('Erreur réseau.', 'err')
    }
    setSeeding(false)
  }

  const filtered = produits.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.nom.toLowerCase().includes(q) || p.slug.includes(q)
    const matchGenre = !filterGenre || p.genre === filterGenre
    return matchSearch && matchGenre
  })

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Produits</h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">{produits.length} produit{produits.length !== 1 ? 's' : ''} dans la base de données</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {produits.length === 0 ? (
            <button onClick={() => handleSeed(false)} disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 px-3 py-2 text-theme-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors disabled:opacity-60">
              {seeding ? 'Initialisation...' : '⚡ Initialiser les produits WOG'}
            </button>
          ) : (
            <button onClick={() => handleSeed(true)} disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-lg border border-warning-300 px-3 py-2 text-theme-xs font-medium text-warning-600 hover:bg-warning-50 dark:border-warning-500/30 dark:text-warning-400 dark:hover:bg-warning-500/10 transition-colors disabled:opacity-60">
              {seeding ? 'Réinitialisation...' : '↺ Réinitialiser le catalogue'}
            </button>
          )}
          <button onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Nouveau produit
          </button>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-theme-sm font-medium ${msgType === 'ok' ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400' : 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400'}`}>
          {msg}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-theme-xs border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400 w-full" />
        </div>
        <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}
          className="px-3 py-1.5 text-theme-xs border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
          <option value="">Tous les genres</option>
          <option value="HOMME">Homme</option>
          <option value="FEMME">Femme</option>
          <option value="UNISEXE">Unisexe</option>
        </select>
      </div>

      {/* Grille produits */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
          <svg className="mx-auto mb-3 text-gray-300 dark:text-gray-600" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {search || filterGenre ? 'Aucun produit ne correspond aux filtres.' : 'Aucun produit. Cliquez sur « Initialiser » ou « Nouveau produit ».'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] group">
              {/* Image */}
              <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {p.images.length > 0 ? (
                  <Image src={p.images[0].url} alt={p.nom} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge size="sm" color={STATUT_BADGE[p.statut] ?? 'light'}>{p.statut}</Badge>
                </div>
                {!p.actif && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Inactif</span>
                  </div>
                )}
              </div>
              {/* Infos */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 leading-tight line-clamp-2">{p.nom}</p>
                  <Badge size="sm" color={GENRE_BADGE[p.genre] ?? 'light'}>{p.genre}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-bold text-gray-800 dark:text-white/90">{p.prix.toLocaleString('fr-FR')} XOF</span>
                  {p.prixOriginal && (
                    <span className="text-theme-xs text-gray-400 line-through">{p.prixOriginal.toLocaleString('fr-FR')}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-theme-xs text-gray-500 dark:text-gray-400">
                  <span>Stock : <strong className={p.stock === 0 ? 'text-error-600' : p.stock < 5 ? 'text-warning-600' : 'text-success-600'}>{p.stock}</strong></span>
                  <span>{p._count?.lignesCommande ?? 0} ventes</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 rounded-lg border border-brand-200 py-1.5 text-theme-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(p.id)}
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {modal.mode === 'create' ? 'Nouveau produit' : `Modifier : ${modal.produit?.nom}`}
              </h3>
              <button onClick={() => setModal(m => ({ ...m, open: false }))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Images — max 4 */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images du produit <span className="text-error-500 font-semibold">*</span>
                  <span className="text-gray-400 font-normal ml-1">({form.images.length}/4 — 1ère principale, 2ème survol)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/60 text-white py-0.5">Principale</span>
                      )}
                      {i === 1 && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/40 text-white py-0.5">Hover</span>
                      )}
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <label className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors ${uploading || form.images.length >= 4 ? 'opacity-50 pointer-events-none' : ''}`}>
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
                {form.images.length === 0 && (
                  <p className="text-[11px] text-error-500 font-medium mt-1">Au moins une image est requise pour créer un produit.</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP · max 5 Mo chacune.</p>
              </div>

              {/* Nom + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                  <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value, slug: f.slug || autoSlug(e.target.value) }))}
                    required className={inputCls} placeholder="Collection Noire Homme Vol.1" />
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
                  <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className={inputCls} placeholder="auto-généré" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className={`${inputCls} resize-none`} placeholder="Description du produit..." />
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prix (XOF) *</label>
                  <input type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                    required className={inputCls} placeholder="85000" min="0" />
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prix barré (XOF)</label>
                  <input type="number" value={form.prixOriginal} onChange={e => setForm(f => ({ ...f, prixOriginal: e.target.value }))}
                    className={inputCls} placeholder="110000 (optionnel)" min="0" />
                </div>
              </div>

              {/* Catégorie + Collection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} className={inputCls}>
                    <option value="vetements">Vêtements</option>
                    <option value="accessoires">Accessoires</option>
                    <option value="editions-limitees">Éditions limitées</option>
                  </select>
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Collection</label>
                  <select value={form.collectionId} onChange={e => setForm(f => ({ ...f, collectionId: e.target.value }))} className={inputCls}>
                    <option value="">Aucune collection</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Genre + Statut + Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                  <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} className={inputCls}>
                    <option value="HOMME">Homme</option>
                    <option value="FEMME">Femme</option>
                    <option value="UNISEXE">Unisexe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} className={inputCls}>
                    <option value="STANDARD">Standard</option>
                    <option value="NEW">Nouveau</option>
                    <option value="EXCLUSIVE">Exclusif</option>
                    <option value="SALE">Promo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Stock total</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    className={inputCls} placeholder="0" min="0" />
                </div>
              </div>

              {/* Marque + Actif */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Marque</label>
                  <input type="text" value={form.marque} onChange={e => setForm(f => ({ ...f, marque: e.target.value }))}
                    className={inputCls} placeholder="WOG Style" />
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Visibilité</label>
                  <select value={form.actif ? 'actif' : 'inactif'} onChange={e => setForm(f => ({ ...f, actif: e.target.value === 'actif' }))} className={inputCls}>
                    <option value="actif">Visible (actif)</option>
                    <option value="inactif">Masqué (inactif)</option>
                  </select>
                </div>
              </div>

              {/* Tailles */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Tailles & stock par taille</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {form.tailles.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <input type="text" value={t.label} onChange={e => setForm(f => { const ts = [...f.tailles]; ts[i] = { ...ts[i], label: e.target.value }; return { ...f, tailles: ts } })}
                        className="w-10 text-xs font-bold text-gray-700 dark:text-gray-300 bg-transparent border-none outline-none" />
                      <input type="number" value={t.stock} min="0" onChange={e => setForm(f => { const ts = [...f.tailles]; ts[i] = { ...ts[i], stock: parseInt(e.target.value) || 0 }; return { ...f, tailles: ts } })}
                        className="flex-1 text-xs text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none text-right tabular-nums" />
                      <button type="button" onClick={() => setForm(f => ({ ...f, tailles: f.tailles.filter((_, j) => j !== i) }))}
                        className="text-gray-300 hover:text-error-400 dark:hover:text-error-400 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, tailles: [...f.tailles, { label: '', stock: 0, disponible: true }] }))}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-theme-xs text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Taille
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button type="submit" disabled={saving || form.images.length === 0}
                  className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors">
                  {saving ? 'Enregistrement...' : modal.mode === 'create' ? 'Créer le produit' : 'Enregistrer les modifications'}
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
