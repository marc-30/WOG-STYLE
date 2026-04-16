'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function WogMonthlyTarget() {
  const [stats, setStats] = useState<{ ca: { valeur: number } } | null>(null)
  const OBJECTIF = 500000 // 500 000 XOF objectif mensuel

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
  }, [])

  // CA du mois en cours (simplifié : on utilise le total pour l'instant)
  const caMois = stats?.ca.valeur ?? 0
  const percent = Math.min(Math.round((caMois / OBJECTIF) * 100), 100)

  const options: ApexOptions = {
    chart: { type: 'radialBar', fontFamily: 'Inter, sans-serif', sparkline: { enabled: true } },
    colors: ['#465fff'],
    plotOptions: {
      radialBar: {
        startAngle: -90, endAngle: 90,
        hollow: { size: '60%' },
        track: { background: '#e5e7eb', strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: '22px', fontWeight: '700', color: '#1e293b',
            formatter: (v) => `${v}%`,
            offsetY: -5,
          },
        },
      },
    },
    fill: { type: 'solid' },
    stroke: { lineCap: 'round' },
    labels: ['Progression'],
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Objectif mensuel</h3>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">Objectif : {OBJECTIF.toLocaleString('fr-FR')} XOF</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <Chart type="radialBar" height={200} options={options} series={[percent]} />
        <div className="mt-2 text-center">
          {percent === 0 ? (
            <p className="text-theme-sm text-gray-400 dark:text-gray-500">Aucune vente enregistrée.</p>
          ) : (
            <p className="text-theme-sm text-gray-600 dark:text-gray-300">
              <span className="font-bold text-gray-800 dark:text-white/90">{caMois.toLocaleString('fr-FR')} XOF</span> réalisés
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
