export default function AdminCRMPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-500">
          <path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/>
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">CRM & Analyse</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Les rapports, statistiques et outils CRM seront disponibles prochainement.</p>
    </div>
  )
}
