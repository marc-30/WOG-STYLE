'use client'
import { useState, useEffect } from 'react'

type Priorite = 'HAUTE' | 'MOYENNE' | 'BASSE'
type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'TERMINE'

interface Tache {
  id: string; titre: string
  priorite: Priorite; statut: StatutTache
  echeance: string | null; assignee: string | null
}

const PCOLOR: Record<Priorite, string> = {
  HAUTE: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400',
  MOYENNE: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400',
  BASSE: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400',
}
const PFR: Record<Priorite, string> = { HAUTE: 'Haute', MOYENNE: 'Moyenne', BASSE: 'Basse' }
const SFR: Record<StatutTache, string> = { A_FAIRE: 'À faire', EN_COURS: 'En cours', TERMINE: 'Terminé' }
const NEXT: Record<StatutTache, StatutTache> = { A_FAIRE: 'EN_COURS', EN_COURS: 'TERMINE', TERMINE: 'A_FAIRE' }

export default function WogTasks() {
  const [taches, setTaches] = useState<Tache[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titre: '', priorite: 'MOYENNE', echeance: '', assignee: '' })

  const fetchTaches = () => {
    fetch('/api/admin/taches')
      .then(r => r.ok ? r.json() : { taches: [] })
      .then(d => setTaches(d.taches || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTaches() }, [])

  const cycleStatut = async (t: Tache) => {
    const next = NEXT[t.statut]
    setTaches(prev => prev.map(x => x.id === t.id ? { ...x, statut: next } : x))
    await fetch(`/api/admin/taches/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: next }),
    })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titre.trim()) return
    const res = await fetch('/api/admin/taches', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, statut: 'A_FAIRE' }),
    })
    if (res.ok) {
      fetchTaches()
      setShowForm(false)
      setForm({ titre: '', priorite: 'MOYENNE', echeance: '', assignee: '' })
    }
  }

  const handleDelete = async (id: string) => {
    setTaches(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/admin/taches/${id}`, { method: 'DELETE' })
  }

  const counts = { af: taches.filter(t => t.statut === 'A_FAIRE').length, ec: taches.filter(t => t.statut === 'EN_COURS').length, tr: taches.filter(t => t.statut === 'TERMINE').length }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Tâches</h3>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {counts.af} à faire · {counts.ec} en cours · {counts.tr} terminées
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] space-y-3">
          <input type="text" placeholder="Titre de la tâche *" value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} required
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
              <option value="HAUTE">Haute priorité</option>
              <option value="MOYENNE">Moyenne priorité</option>
              <option value="BASSE">Basse priorité</option>
            </select>
            <input type="date" value={form.echeance} onChange={e => setForm(f => ({ ...f, echeance: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
          </div>
          <input type="text" placeholder="Assigné à (optionnel)" value={form.assignee}
            onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">Annuler</button>
          </div>
        </form>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <svg className="animate-spin w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : taches.length === 0 ? (
          <p className="py-10 text-center text-theme-sm text-gray-400 dark:text-gray-500">Aucune tâche. Cliquez sur Ajouter.</p>
        ) : (
          taches.map(t => (
            <div key={t.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
              <button onClick={() => cycleStatut(t)} title={`→ ${SFR[NEXT[t.statut]]}`}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${t.statut === 'TERMINE' ? 'bg-success-500 border-success-500'
                    : t.statut === 'EN_COURS' ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-gray-300 dark:border-gray-600'}`}>
                {t.statut === 'TERMINE' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                {t.statut === 'EN_COURS' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-theme-sm font-medium ${t.statut === 'TERMINE' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white/90'}`}>
                  {t.titre}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${PCOLOR[t.priorite]}`}>{PFR[t.priorite]}</span>
                  {t.echeance && <span className="text-[11px] text-gray-400">{new Date(t.echeance).toLocaleDateString('fr-FR')}</span>}
                  {t.assignee && <span className="text-[11px] text-gray-400">{t.assignee}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-error-500 transition-all flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
