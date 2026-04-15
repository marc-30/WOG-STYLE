'use client'
import { useState } from 'react'

type PostItColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple'

interface PostIt {
  id: number; contenu: string; couleur: PostItColor; createdAt: string
}

const colorMap: Record<PostItColor, { bg: string; border: string; label: string }> = {
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20', label: 'Jaune' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',   border: 'border-blue-200 dark:border-blue-500/20',   label: 'Bleu' },
  green:  { bg: 'bg-green-50 dark:bg-green-500/10',  border: 'border-green-200 dark:border-green-500/20',  label: 'Vert' },
  pink:   { bg: 'bg-pink-50 dark:bg-pink-500/10',    border: 'border-pink-200 dark:border-pink-500/20',    label: 'Rose' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10',border: 'border-purple-200 dark:border-purple-500/20',label: 'Violet' },
}

export default function WogPostIt() {
  const [notes, setNotes] = useState<PostIt[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ contenu: '', couleur: 'yellow' as PostItColor })

  const handleAdd = () => {
    if (!form.contenu.trim()) return
    setNotes(prev => [...prev, { id: Date.now(), contenu: form.contenu, couleur: form.couleur, createdAt: new Date().toLocaleDateString('fr-FR') }])
    setForm({ contenu: '', couleur: 'yellow' })
    setShowModal(false)
  }

  const handleDelete = (id: number) => setNotes(prev => prev.filter(n => n.id !== id))

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Post-it</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">{notes.length} note{notes.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Ajouter une note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="py-10 text-center">
          <svg className="mx-auto mb-3 text-gray-300 dark:text-gray-700" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          <p className="text-theme-sm text-gray-400 dark:text-gray-500">Aucune note. Ajoutez votre premier post-it !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {notes.map(n => (
            <div key={n.id} className={`relative rounded-xl border p-4 ${colorMap[n.couleur].bg} ${colorMap[n.couleur].border}`}>
              <button onClick={() => handleDelete(n.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-error-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <p className="text-sm text-gray-800 dark:text-white/90 pr-5 whitespace-pre-wrap leading-relaxed">{n.contenu}</p>
              <p className="mt-3 text-theme-xs text-gray-400 dark:text-gray-500">{n.createdAt}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Nouveau Post-it</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Note *</label>
                <textarea value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
                  rows={5} placeholder="Écrivez votre note ici..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400 resize-none" />
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur</label>
                <div className="flex gap-2">
                  {(Object.keys(colorMap) as PostItColor[]).map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, couleur: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${form.couleur === c ? 'scale-125 border-gray-600 dark:border-white' : 'border-transparent'}
                        ${c === 'yellow' ? 'bg-yellow-300' : c === 'blue' ? 'bg-blue-300' : c === 'green' ? 'bg-green-300' : c === 'pink' ? 'bg-pink-300' : 'bg-purple-300'}`}
                      title={colorMap[c].label} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleAdd} className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Ajouter</button>
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
