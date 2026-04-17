'use client'
import { useEffect, useState } from 'react'
import Badge from './Badge'

interface Commande {
  id: string; reference: string; statut: string; montantTotal: number; methodePaiement: string; createdAt: string
  utilisateur: { prenom: string; nom: string; email: string | null }
  lignes: { produit: { nom: string } }[]
}

const statutColor: Record<string, 'success' | 'warning' | 'primary' | 'error' | 'info' | 'light'> = {
  PAYE: 'success', EN_PREPARATION: 'primary', EXPEDIE: 'info',
  LIVRE: 'success', EN_ATTENTE: 'warning', ANNULE: 'error',
}
const statutFR: Record<string, string> = {
  PAYE: 'Payé', EN_PREPARATION: 'En préparation', EXPEDIE: 'Expédié',
  LIVRE: 'Livré', EN_ATTENTE: 'En attente', ANNULE: 'Annulé',
}

export default function WogRecentOrders() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/commandes?limit=8')
      .then(r => r.ok ? r.json() : { commandes: [] })
      .then(d => setCommandes(d.commandes || []))
      .catch(() => setCommandes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Commandes récentes</h3>
          <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">{commandes.length} commandes</p>
        </div>
        <a href="/admin/commandes" className="text-theme-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400">Voir tout →</a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : commandes.length === 0 ? (
        <div className="py-14 text-center text-theme-sm text-gray-400 dark:text-gray-500">
          <svg className="mx-auto mb-3 opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {commandes.map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3.5 sm:px-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {c.utilisateur.prenom[0]}{c.utilisateur.nom[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {c.utilisateur.prenom} {c.utilisateur.nom}
                  </p>
                  <p className="text-theme-xs text-gray-400 dark:text-gray-500 truncate">
                    {c.lignes[0]?.produit.nom ?? 'Commande'}
                    {c.lignes.length > 1 && ` +${c.lignes.length - 1}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <Badge size="sm" color={statutColor[c.statut] ?? 'light'}>{statutFR[c.statut] ?? c.statut}</Badge>
                <span className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 tabular-nums">
                  {c.montantTotal.toLocaleString('fr-FR')} XOF
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
