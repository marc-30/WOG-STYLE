'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface AnalyticsData {
  labels: string[]
  ventes: number[]
  commandes: number[]
  clients: number[]
  topProduits: { nom: string; image: string | null; quantite: number; ca: number }[]
  statutStats: { statut: string; count: number }[]
}

interface Stats {
  ca: { valeur: number; pct: string }
  commandes: { valeur: number; mois: number; pct: string }
  clients: { valeur: number; pct: string }
  conversion: { valeur: number }
  produits: { valeur: number }
}

const STATUT_FR: Record<string, string> = {
  EN_ATTENTE: 'En attente', PAYE: 'Payées', EN_PREPARATION: 'En préparation',
  EXPEDIE: 'Expédiées', LIVRE: 'Livrées', ANNULE: 'Annulées',
}
const STATUT_COLOR: Record<string, string> = {
  PAYE: '#22c55e', LIVRE: '#16a34a', EN_PREPARATION: '#3b82f6',
  EXPEDIE: '#06b6d4', EN_ATTENTE: '#f59e0b', ANNULE: '#ef4444',
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'6m' | '1y'>('6m')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/admin/analytics?period=${period}`).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null),
    ]).then(([a, s]) => {
      if (a) setAnalytics(a)
      if (s) setStats(s)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [period])

  const labels = analytics?.labels ?? []
  const ventesData = analytics?.ventes ?? []
  const clientsData = analytics?.clients ?? []

  const barOptions: ApexOptions = {
    chart: { fontFamily: 'Inter, sans-serif', type: 'bar', height: 260, toolbar: { show: false } },
    colors: ['#465fff', '#22c55e'],
    plotOptions: { bar: { horizontal: false, columnWidth: '40%', borderRadius: 4, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '11px', colors: '#9ca3af' } } },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#9ca3af' }, formatter: (v) => v === 0 ? '0' : `${v}k` } },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    legend: { show: true, position: 'top', horizontalAlign: 'right', fontFamily: 'Inter, sans-serif', fontSize: '12px' },
    tooltip: { y: { formatter: (v) => `${v}k XOF` } },
  }

  const donutOptions: ApexOptions = {
    chart: { fontFamily: 'Inter, sans-serif', type: 'donut', height: 220 },
    colors: (analytics?.statutStats ?? []).map(s => STATUT_COLOR[s.statut] ?? '#9ca3af'),
    labels: (analytics?.statutStats ?? []).map(s => STATUT_FR[s.statut] ?? s.statut),
    dataLabels: { enabled: false },
    legend: { show: true, position: 'bottom', fontFamily: 'Inter, sans-serif', fontSize: '11px' },
    plotOptions: { pie: { donut: { size: '70%' } } },
    tooltip: { y: { formatter: (v) => `${v} commande${v !== 1 ? 's' : ''}` } },
  }

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-theme-xs font-medium border transition-colors ${active
      ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400'
      : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400'}`

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Rapports & Statistiques</h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">Données réelles de la base de données WOG</p>
        </div>
        <div className="flex gap-1.5">
          <button className={btnClass(period === '6m')} onClick={() => setPeriod('6m')}>6 mois</button>
          <button className={btnClass(period === '1y')} onClick={() => setPeriod('1y')}>1 an</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : (
        <>
          {/* KPIs résumé */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Chiffre d'affaires total", value: `${fmt(stats?.ca.valeur ?? 0)} XOF`, sub: `${stats?.ca.pct ?? 0}% vs période préc.` },
              { label: 'Total commandes', value: fmt(stats?.commandes.valeur ?? 0), sub: `${stats?.commandes.mois ?? 0} ce mois` },
              { label: 'Clients actifs', value: fmt(stats?.clients.valeur ?? 0), sub: `${stats?.clients.pct ?? 0}% croissance` },
              { label: 'Taux de conversion', value: `${stats?.conversion.valeur ?? 0}%`, sub: `${stats?.produits.valeur ?? 0} produits actifs` },
            ].map(k => (
              <div key={k.label} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">{k.label}</p>
                <p className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90 tabular-nums">{k.value}</p>
                <p className="mt-1 text-theme-xs text-gray-400 dark:text-gray-500">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique ventes + clients */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Évolution des ventes & nouveaux clients</h2>
              {(ventesData.every(v => v === 0) && clientsData.every(v => v === 0)) ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="mb-3 opacity-40" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <p className="text-theme-sm">Aucune donnée pour cette période.</p>
                  <p className="text-theme-xs mt-1">Les graphiques se rempliront avec les premières ventes.</p>
                </div>
              ) : (
                <Chart type="bar" height={260} options={barOptions}
                  series={[
                    { name: 'Ventes (kXOF)', data: ventesData },
                    { name: 'Nouveaux clients', data: clientsData },
                  ]} />
              )}
            </div>

            {/* Répartition statuts */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Statuts des commandes</h2>
              {!analytics?.statutStats.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="mb-3 opacity-40" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                  <p className="text-theme-sm">Aucune commande.</p>
                </div>
              ) : (
                <>
                  <Chart type="donut" height={220} options={donutOptions}
                    series={analytics.statutStats.map(s => s.count)} />
                  <div className="mt-3 space-y-1.5">
                    {analytics.statutStats.map(s => (
                      <div key={s.statut} className="flex items-center justify-between text-theme-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUT_COLOR[s.statut] ?? '#9ca3af' }} />
                          <span className="text-gray-600 dark:text-gray-400">{STATUT_FR[s.statut] ?? s.statut}</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white/80">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top produits */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Top produits (par quantité vendue)</h2>
            {!analytics?.topProduits.length ? (
              <div className="py-10 text-center text-theme-sm text-gray-400 dark:text-gray-500">
                Aucune vente enregistrée. Les produits les plus vendus apparaîtront ici.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topProduits.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-6 text-theme-xs font-bold text-gray-400 text-right flex-shrink-0">{i + 1}</span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {p.image && <img src={p.image} alt={p.nom} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90 truncate">{p.nom}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">{p.quantite} vendus</p>
                      <p className="text-theme-xs text-gray-400">{fmt(p.ca)} XOF</p>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-1.5 rounded-full bg-brand-500"
                          style={{ width: `${Math.min((p.quantite / (analytics.topProduits[0]?.quantite || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
