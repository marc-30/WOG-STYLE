'use client'
import { useState } from 'react'

type Priority = 'haute' | 'moyenne' | 'basse'
type Status = 'à faire' | 'en cours' | 'terminé'

interface Task {
  id: number; titre: string; priorite: Priority; statut: Status; echeance: string; assignee: string
}

const priorityColors: Record<Priority, string> = {
  haute: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400',
  moyenne: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
  basse: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400',
}
const statusColors: Record<Status, string> = {
  'à faire': 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400',
  'en cours': 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  'terminé': 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400',
}

export default function WogTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ titre: '', priorite: 'moyenne' as Priority, statut: 'à faire' as Status, echeance: '', assignee: '' })

  const openAdd = () => { setEditTask(null); setForm({ titre: '', priorite: 'moyenne', statut: 'à faire', echeance: '', assignee: '' }); setShowModal(true) }
  const openEdit = (t: Task) => { setEditTask(t); setForm({ titre: t.titre, priorite: t.priorite, statut: t.statut, echeance: t.echeance, assignee: t.assignee }); setShowModal(true) }
  const handleDelete = (id: number) => setTasks(prev => prev.filter(t => t.id !== id))
  const toggleStatus = (id: number) => setTasks(prev => prev.map(t => {
    if (t.id !== id) return t
    const next: Status = t.statut === 'à faire' ? 'en cours' : t.statut === 'en cours' ? 'terminé' : 'à faire'
    return { ...t, statut: next }
  }))

  const handleSave = () => {
    if (!form.titre) return
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...form } : t))
    } else {
      setTasks(prev => [...prev, { id: Date.now(), ...form }])
    }
    setShowModal(false)
  }

  const counts = { 'à faire': tasks.filter(t => t.statut === 'à faire').length, 'en cours': tasks.filter(t => t.statut === 'en cours').length, 'terminé': tasks.filter(t => t.statut === 'terminé').length }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Tâches</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {counts['à faire']} à faire · {counts['en cours']} en cours · {counts['terminé']} terminées
          </p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouvelle tâche
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-10 text-center">
          <svg className="mx-auto mb-3 text-gray-300 dark:text-gray-700" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <p className="text-theme-sm text-gray-400 dark:text-gray-500">Aucune tâche. Créez-en une !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <button onClick={() => toggleStatus(t.id)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${t.statut === 'terminé' ? 'bg-success-500 border-success-500' : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'}`}>
                {t.statut === 'terminé' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${t.statut === 'terminé' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white/90'}`}>{t.titre}</p>
                <div className="flex items-center gap-2 mt-1">
                  {t.assignee && <span className="text-theme-xs text-gray-400 dark:text-gray-500">@{t.assignee}</span>}
                  {t.echeance && <span className="text-theme-xs text-gray-400 dark:text-gray-500">· {t.echeance}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-theme-xs font-medium ${priorityColors[t.priorite]}`}>{t.priorite}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-theme-xs font-medium ${statusColors[t.statut]}`}>{t.statut}</span>
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-brand-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-error-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">{editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                <input type="text" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  placeholder="Description de la tâche..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
                  <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value as Priority }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as Status }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
                    <option value="à faire">À faire</option>
                    <option value="en cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assigné à</label>
                  <input type="text" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                    placeholder="Prénom"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Échéance</label>
                  <input type="date" value={form.echeance} onChange={e => setForm(f => ({ ...f, echeance: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                {editTask ? 'Enregistrer' : 'Créer'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
