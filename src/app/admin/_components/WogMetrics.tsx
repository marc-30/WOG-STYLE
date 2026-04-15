'use client'

const metrics = [
  {
    label: "Chiffre d'affaires",
    value: "0 XOF",
    change: "0%",
    trend: "up" as const,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M12 6v2M12 16v2M8.5 9.5a3.5 3.5 0 0 1 7 0c0 1.93-1.57 3.5-3.5 3.5S8.5 13.43 8.5 11.5"/>
      </svg>
    ),
  },
  {
    label: "Commandes",
    value: "0",
    change: "0%",
    trend: "up" as const,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    label: "Clients actifs",
    value: "0",
    change: "0%",
    trend: "up" as const,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: "Taux de conversion",
    value: "0%",
    change: "0%",
    trend: "up" as const,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

export default function WogMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {metrics.map((m) => (
        <div key={m.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 text-gray-700 dark:text-white/80">
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-theme-sm text-gray-500 dark:text-gray-400">{m.label}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{m.value}</h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {m.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
