'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function WogSalesChart() {
  const [period, setPeriod] = useState<'6m' | '1y'>('6m')

  const labels6m = ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr']
  const labels1y = ['Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr']
  const zeros6m  = [0, 0, 0, 0, 0, 0]
  const zeros1y  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  const labels    = period === '6m' ? labels6m : labels1y
  const salesData = period === '6m' ? zeros6m  : zeros1y

  const options: ApexOptions = {
    chart: { fontFamily: 'Inter, sans-serif', type: 'bar', height: 240, toolbar: { show: false } },
    colors: ['#465fff'],
    plotOptions: { bar: { horizontal: false, columnWidth: '42%', borderRadius: 5, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false },
      labels: { style: { fontSize: '12px', colors: '#9ca3af' } } },
    yaxis: { labels: { style: { fontSize: '12px', colors: '#9ca3af' }, formatter: (v) => `${v}k` } },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: (v) => `${v}k XOF` } },
  }

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-theme-xs font-medium border transition-colors ${
      active
        ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400'
        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
    }`

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Ventes mensuelles</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Ventes réelles (en milliers XOF)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPeriod('6m')} className={btnClass(period === '6m')}>6 mois</button>
          <button onClick={() => setPeriod('1y')} className={btnClass(period === '1y')}>1 an</button>
        </div>
      </div>
      <Chart options={options} series={[{ name: 'Ventes', data: salesData }]} type="bar" height={240} />
    </div>
  )
}
