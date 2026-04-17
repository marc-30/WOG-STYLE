'use client'
import { useEffect, useState } from 'react'

interface Stats {
  ca: { valeur: number; pct: string }
  commandes: { valeur: number; mois: number; pct: string }
  clients: { valeur: number; pct: string }
  conversion: { valeur: number }
  produits: { valeur: number }
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

export default function WogMetrics() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
  }, [])

  const cards = [
    {
      label: "Chiffre d'affaires",
      value: stats ? `${fmt(stats.ca.valeur)} XOF` : '— XOF',
      pct: stats ? `${Number(stats.ca.pct) >= 0 ? '+' : ''}${stats.ca.pct}%` : '0%',
      trend: stats ? (Number(stats.ca.pct) >= 0 ? 'up' : 'down') : 'up',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v2M12 16v2M8.5 9.5a3.5 3.5 0 0 1 7 0c0 1.93-1.57 3.5-3.5 3.5S8.5 13.43 8.5 11.5"/>
        </svg>
      ),
    },
    {
      label: 'Commandes',
      value: stats ? fmt(stats.commandes.valeur) : '0',
      pct: stats ? `${Number(stats.commandes.pct) >= 0 ? '+' : ''}${stats.commandes.pct}%` : '0%',
      trend: stats ? (Number(stats.commandes.pct) >= 0 ? 'up' : 'down') : 'up',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
    },
    {
      label: 'Clients actifs',
      value: stats ? fmt(stats.clients.valeur) : '0',
      pct: stats ? `${Number(stats.clients.pct) >= 0 ? '+' : ''}${stats.clients.pct}%` : '0%',
      trend: stats ? (Number(stats.clients.pct) >= 0 ? 'up' : 'down') : 'up',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: 'Taux de conversion',
      value: stats ? `${stats.conversion.valeur}%` : '0%',
      pct: stats ? `${stats.produits.valeur} produits` : '0 produits',
      trend: 'up' as const,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {cards.map((m) => (
        <div key={m.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 text-gray-700 dark:text-white/80">
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">{m.label}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 tabular-nums">{m.value}</h4>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${m.trend === 'up' ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500' : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'}`}>
              {m.pct}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
