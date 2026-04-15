export default function AdminProduitsPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-500">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Produits</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">La gestion des produits sera disponible prochainement.</p>
    </div>
  )
}
