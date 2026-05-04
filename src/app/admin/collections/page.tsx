'use client'
import { useState, useEffect } from 'react'

interface Collection {
  id: string
  slug: string
  nom: string
  description: string | null
  imageUrl: string | null
  actif: boolean
  createdAt: string
  _count?: { produits: number }
}

type ModalMode = 'create' | 'edit'

function emptyForm() {
  return { nom: '', description: '', imageUrl: '', actif: true }
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400'

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; collection: Collection | null }>({
    open: false, mode: 'create', collection: null,
  })
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 5000)
  }

  const fetchCollections = () => {
    setLoading(true)
    fetch('/api/admin/collections')
      .then(r => r.ok ? r.json() : { collections: [] })
      .then(d => setCollections(d.collections ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCollections() }, [])

  const openCreate = () => {
    setForm(emptyForm())
    setModal({ open: true, mode: 'create', collection: null })
  }

  const openEdit = (c: Collection) => {
    setForm({ nom: c.nom, description: c.description ?? '', imageUrl: c.imageUrl ?? '', actif: c.actif })
    setModal({ open: true, mode: 'edit', collection: c })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) { showMsg('Le nom est obligatoire.', 'err'); return }
    setSaving(true)
    try {
      const url = modal.mode === 'edit'
        ? `/api/admin/collections/${modal.collection!.id}`
        : '/api/admin/collections'
      const method = modal.mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom.trim(),
          description: form.description || null,
          imageUrl: form.imageUrl || null,
          actif: form.actif,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        showMsg(modal.mode === 'edit' ? 'Collection modifiée.' : 'Collection créée.')
        setModal({ open: false, mode: 'create', collection: null })
        fetchCollections()
      } else {
        showMsg(data.error || 'Erreur.', 'err')
      }
    } catch { showMsg('Erreur réseau.', 'err') }
    setSaving(false)
  }

  const handleDelete = async (c: Collection) => {
    const count = c._count?.produits ?? 0
    const confirm1 = confirm(
      `Supprimer la collection "${c.nom}" ?${count > 0 ? `\n⚠ ${count} produit(s) seront détachés de cette collection.` : ''}`
    )
    if (!confirm1) return
    const res = await fetch(`/api/admin/collections/${c.id}`, { method: 'DELETE' })
    if (res.ok) { showMsg('Collection supprimée.'); fetchCollections() }
    else showMsg('Erreur de suppression.', 'err')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Collections</h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {collections.length} collection{collections.length !== 1 ? 's' : ''} dans la base de données
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nouvelle collection
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-theme-sm font-medium ${
          msgType === 'ok'
            ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400'
            : 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400'
        }`}>
          {msg}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aucune collection. Cliquez sur « Nouvelle collection » pour commencer.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collection</th>
                <th className="px-4 py-3 text-left text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-center text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produits</th>
                <th className="px-4 py-3 text-center text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {collections.map(c => (
                <tr key={c.id} className="bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={c.imageUrl} alt={c.nom} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white/90">{c.nom}</p>
                        {c.description && (
                          <p className="text-theme-xs text-gray-400 line-clamp-1 max-w-xs">{c.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <code className="text-theme-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {c.slug}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {c._count?.produits ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-theme-xs font-medium ${
                      c.actif
                        ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {c.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg border border-brand-200 px-3 py-1.5 text-theme-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="rounded-lg border border-error-200 px-3 py-1.5 text-theme-xs font-medium text-error-600 hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL Créer / Modifier */}
      {modal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {modal.mode === 'create' ? 'Nouvelle collection' : `Modifier : ${modal.collection?.nom}`}
              </h3>
              <button
                onClick={() => setModal(m => ({ ...m, open: false }))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de la collection *
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  required
                  className={inputCls}
                  placeholder="EDEN, GENÈSE, WOG HOMME..."
                />
                {form.nom && (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Slug : <code>{form.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</code>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Description de la collection..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image de couverture (URL)
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className={inputCls}
                  placeholder="/images/collection-eden.jpg ou https://..."
                />
                {form.imageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
              </div>

              {/* Statut */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  value={form.actif ? 'actif' : 'inactif'}
                  onChange={e => setForm(f => ({ ...f, actif: e.target.value === 'actif' }))}
                  className={inputCls}
                >
                  <option value="actif">Active</option>
                  <option value="inactif">Inactive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Enregistrement...' : modal.mode === 'create' ? 'Créer la collection' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(m => ({ ...m, open: false }))}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
                >
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
