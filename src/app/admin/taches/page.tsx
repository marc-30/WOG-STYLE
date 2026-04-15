export default function AdminTachesPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-500">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Tâches & Post-it</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos tâches et notes directement depuis le tableau de bord principal.</p>
    </div>
  )
}
