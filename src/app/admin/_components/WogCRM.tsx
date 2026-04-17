'use client'
import { useState } from 'react'
import Badge from './Badge'

type ContactType = 'Acheteur' | 'Inscrit' | 'Visiteur'
interface Contact {
  id: number; nom: string; email: string; type: ContactType
  initiales: string; montantTotal?: string; derniereVisite: string
}

const avatarColors: Record<ContactType, string> = {
  'Acheteur': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Inscrit': 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400',
  'Visiteur': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const badgeColors: Record<ContactType, 'info' | 'success' | 'warning'> = {
  'Acheteur': 'info', 'Inscrit': 'success', 'Visiteur': 'warning',
}

type Filter = 'Tous' | 'Acheteurs' | 'Inscrits' | 'Visiteurs'

export default function WogCRM() {
  const [contacts] = useState<Contact[]>([])
  const [filter, setFilter] = useState<Filter>('Tous')

  const filtered = contacts.filter((c) => {
    if (filter === 'Acheteurs') return c.type === 'Acheteur'
    if (filter === 'Inscrits') return c.type === 'Inscrit'
    if (filter === 'Visiteurs') return c.type === 'Visiteur'
    return true
  })

  const btnClass = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-theme-xs font-medium border transition-colors ${
      active
        ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400'
        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
    }`

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">CRM — Contacts</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {contacts.length} contact{contacts.length > 1 ? 's' : ''} · Prospection e-mail
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Nouvelle campagne
        </button>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['Tous', 'Acheteurs', 'Inscrits', 'Visiteurs'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={btnClass(filter === f)}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-theme-sm text-gray-400 dark:text-gray-500">
          Aucun contact CRM pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColors[c.type]}`}>{c.initiales}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{c.nom}</p>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400 truncate">{c.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge size="sm" color={badgeColors[c.type]}>{c.type}</Badge>
                {c.montantTotal && <span className="text-theme-xs text-gray-500 dark:text-gray-400">{c.montantTotal}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
          {contacts.filter(c => c.type === 'Acheteur').length} acheteurs · {contacts.filter(c => c.type === 'Visiteur').length} visiteurs
        </span>
        <button className="text-theme-xs text-brand-500 hover:text-brand-600 font-medium dark:text-brand-400">
          Voir tout le CRM →
        </button>
      </div>
    </div>
  )
}
