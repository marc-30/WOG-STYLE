'use client'
import { useState, useEffect } from 'react'
import Badge from '../_components/Badge'

interface CommandeLigne {
  id: string; quantite: number; prixUnitaire: number; taille: string
  produit: { nom: string; images: { url: string }[] }
}
interface Commande {
  id: string; reference: string; statut: string; methodePaiement: string
  montantTotal: number; adresseLivraison: string | null; createdAt: string
  utilisateur: { prenom: string; nom: string; email: string | null; telephone?: string | null }
  lignes: CommandeLigne[]
}

const STATUTS = ['EN_ATTENTE', 'PAYE', 'EN_PREPARATION', 'EXPEDIE', 'LIVRE', 'ANNULE'] as const
const statutColor: Record<string, 'success' | 'warning' | 'primary' | 'error' | 'info' | 'light'> = {
  PAYE: 'success', EN_PREPARATION: 'primary', EXPEDIE: 'info',
  LIVRE: 'success', EN_ATTENTE: 'warning', ANNULE: 'error',
}
const statutFR: Record<string, string> = {
  PAYE: 'Payé', EN_PREPARATION: 'En préparation', EXPEDIE: 'Expédié',
  LIVRE: 'Livré', EN_ATTENTE: 'En attente', ANNULE: 'Annulé',
}

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Commande | null>(null)
  const [savingStatut, setSavingStatut] = useState(false)

  const fetchCommandes = () => {
    setLoading(true)
    fetch('/api/admin/commandes?limit=100')
      .then(r => r.ok ? r.json() : { commandes: [] })
      .then(d => setCommandes(d.commandes ?? []))
      .catch(() => setCommandes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCommandes() }, [])

  const handleStatutChange = async (id: string, statut: string) => {
    setSavingStatut(true)
    try {
      const res = await fetch('/api/admin/commandes', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, statut }),
      })
      if (res.ok) {
        setCommandes(cs => cs.map(c => c.id === id ? { ...c, statut } : c))
        setSelected(s => s && s.id === id ? { ...s, statut } : s)
      }
    } catch { /* silencieux */ }
    setSavingStatut(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Commandes</h1>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          {commandes.length} commande{commandes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : commandes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune commande pour l'instant.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Référence</th>
                <th className="px-4 py-3 text-left text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Articles</th>
                <th className="px-4 py-3 text-right text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-right text-theme-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {commandes.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)}
                  className="bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-800 dark:text-white/90">{c.utilisateur.prenom} {c.utilisateur.nom}</p>
                    <p className="text-theme-xs text-gray-400">{c.utilisateur.telephone || c.utilisateur.email || ''}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <code className="text-theme-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{c.reference}</code>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-theme-xs text-gray-500 dark:text-gray-400">
                    {c.lignes[0]?.produit.nom ?? '—'}{c.lignes.length > 1 ? ` +${c.lignes.length - 1}` : ''}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-800 dark:text-white/90 tabular-nums">
                    {c.montantTotal.toLocaleString('fr-FR')} XOF
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge size="sm" color={statutColor[c.statut] ?? 'light'}>{statutFR[c.statut] ?? c.statut}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right text-theme-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')} {new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL Détail commande */}
      {selected && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{selected.reference}</h3>
                <p className="text-theme-xs text-gray-400">
                  {new Date(selected.createdAt).toLocaleDateString('fr-FR')} à {new Date(selected.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Client */}
              <div>
                <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Client</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{selected.utilisateur.prenom} {selected.utilisateur.nom}</p>
                {selected.utilisateur.telephone && <p className="text-theme-sm text-gray-500 dark:text-gray-400">{selected.utilisateur.telephone}</p>}
                {selected.utilisateur.email && <p className="text-theme-sm text-gray-500 dark:text-gray-400">{selected.utilisateur.email}</p>}
              </div>

              {/* Livraison */}
              <div>
                <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Adresse de livraison</p>
                <p className="text-theme-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{selected.adresseLivraison || 'Non renseignée'}</p>
              </div>

              {/* Articles */}
              <div>
                <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Articles</p>
                <div className="space-y-2">
                  {selected.lignes.map(l => (
                    <div key={l.id} className="flex items-center gap-3">
                      {l.produit.images[0] && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={l.produit.images[0].url} alt={l.produit.nom} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90 truncate">{l.produit.nom}</p>
                        <p className="text-theme-xs text-gray-400">Taille {l.taille} · x{l.quantite}</p>
                      </div>
                      <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 flex-shrink-0">
                        {(l.prixUnitaire * l.quantite).toLocaleString('fr-FR')} XOF
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paiement */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <p className="text-theme-xs text-gray-400">Méthode de paiement</p>
                  <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{selected.methodePaiement}</p>
                </div>
                <p className="text-base font-black text-gray-800 dark:text-white/90">{selected.montantTotal.toLocaleString('fr-FR')} XOF</p>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut de la commande</label>
                <select value={selected.statut} disabled={savingStatut}
                  onChange={e => handleStatutChange(selected.id, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
                  {STATUTS.map(s => <option key={s} value={s}>{statutFR[s]}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
