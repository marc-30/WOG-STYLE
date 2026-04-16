'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function WogSalesChart() {
  const [period, setPeriod] = useState<'6m' | '1y'>('6m')
  const [data, setData] = useState<{ labels: string[]; ventes: number[]; commandes: number[] } | null>(null)

  useEffect(() => {
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData({ labels: d.labels, ventes: d.ventes, commandes: d.commandes }) })
      .catch(() => {})
  }, [period])

  const labels = data?.labels ?? (period === '6m' ? ['Nov','Déc','Jan','Fév','Mar','Avr'] : ['Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc','Jan','Fév','Mar','Avr'])
  const salesData = data?.ventes ?? Array(labels.length).fill(0)

  const options: ApexOptions = {
    chart: { fontFamily: 'Inter, sans-serif', type: 'bar', height: 240, toolbar: { show: false } },
    colors: ['#465fff'],
    plotOptions: { bar: { horizontal: false, columnWidth: '42%', borderRadius: 5, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { fontSize: '12px', colors: '#9ca3af' } } },
    yaxis: { labels: { style: { fontSize: '12px', colors: '#9ca3af' }, formatter: (v) => v === 0 ? '0' : `${v}k` } },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: (v) => `${v}k XOF` } },
  }

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-theme-xs font-medium border transition-colors ${active
      ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400'
      : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5'}`

  const totalCA = (data?.ventes ?? []).reduce((a, b) => a + b, 0)
  const totalCmds = (data?.commandes ?? []).reduce((a, b) => a + b, 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Chiffre d&apos;affaires</h3>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {totalCA > 0 ? `${(totalCA).toLocaleString('fr-FR')}k XOF · ${totalCmds} commandes` : 'Aucune vente enregistrée'}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button className={btnClass(period === '6m')} onClick={() => setPeriod('6m')}>6 mois</button>
          <button className={btnClass(period === '1y')} onClick={() => setPeriod('1y')}>1 an</button>
        </div>
      </div>
      <Chart type="bar" height={240} options={options} series={[{ name: 'Ventes (kXOF)', data: salesData }]} />
    </div>
  )
}
