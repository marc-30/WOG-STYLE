'use client'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function WogMonthlyTarget() {
  const percent = 0

  const options: ApexOptions = {
    colors: ['#465FFF'],
    chart: { fontFamily: 'Inter, sans-serif', type: 'radialBar', height: 260, sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -85, endAngle: 85,
        hollow: { size: '80%' },
        track: { background: '#E4E7EC', strokeWidth: '100%', margin: 5 },
        dataLabels: {
          name: { show: false },
          value: { fontSize: '36px', fontWeight: '600', offsetY: -40, color: '#1D2939',
            formatter: (val) => val + '%' },
        },
      },
    },
    fill: { type: 'solid', colors: ['#465FFF'] },
    stroke: { lineCap: 'round' },
    labels: ['Progression'],
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-sm rounded-2xl pb-8 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Objectif mensuel</h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Avancement — ce mois</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            0%
          </span>
        </div>
        <div className="relative max-h-[260px]">
          <Chart options={options} series={[percent]} type="radialBar" height={260} />
        </div>
        <p className="mx-auto mt-4 w-full max-w-[340px] text-center text-sm text-gray-500 dark:text-gray-400">
          Aucune vente enregistrée pour le moment. Commencez !
        </p>
      </div>
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {[['Objectif', '0 XOF', 'text-gray-800'], ['Réalisé', '0 XOF', 'text-success-600'], ['Reste', '0 XOF', 'text-orange-500']].map(([l, v, c]) => (
          <div key={l} className="text-center">
            <p className="mb-1 text-gray-500 text-theme-xs dark:text-gray-400">{l}</p>
            <p className={`text-base font-semibold ${c} dark:text-white/90`}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
