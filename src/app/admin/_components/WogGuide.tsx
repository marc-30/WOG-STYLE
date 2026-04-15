'use client'
import { useState } from 'react'

const steps = [
  { n: '1', titre: 'Créer un ticket client', desc: 'Dans CRM → Contacts, cliquez sur le client. Dans sa fiche, utilisez "Créer un ticket" pour documenter un problème ou une demande.' },
  { n: '2', titre: 'Qualifier le contact', desc: 'Catégorisez le contact (Acheteur / Inscrit / Visiteur) pour personnaliser votre approche commerciale.' },
  { n: '3', titre: 'Envoyer une campagne', desc: 'CRM → Campagnes. Sélectionnez un segment, rédigez votre message et planifiez l\'envoi.' },
  { n: '4', titre: 'Suivre les conversions', desc: 'Analyse → Rapports. Mesurez le taux de conversion de chaque campagne et ajustez votre stratégie.' },
  { n: '5', titre: 'Gérer le cycle complet', desc: 'Prospect → Contact → Acheteur → Fidèle. Chaque étape est documentée dans le CRM pour une vue 360°.' },
]

export default function WogGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mx-auto mb-6 w-full max-w-[220px] flex items-center gap-2.5 rounded-2xl border border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10 px-4 py-3 hover:bg-brand-100 dark:hover:bg-brand-500/15 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 text-white flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="text-left">
          <p className="text-theme-xs font-semibold text-brand-700 dark:text-brand-400">Guide CRM</p>
          <p className="text-theme-xs text-brand-500/70 dark:text-brand-500/50 -mt-0.5">Voir le tutoriel</p>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Guide CRM — WOG Admin</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-theme-sm text-gray-500 dark:text-gray-400 mb-6">
                Ce guide vous explique comment utiliser le CRM WOG de bout en bout — de la création d'un ticket jusqu'à la conversion d'un client.
              </p>
              <div className="space-y-4">
                {steps.map(s => (
                  <div key={s.n} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center">{s.n}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-1">{s.titre}</h4>
                      <p className="text-theme-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                <p className="text-theme-xs font-semibold text-brand-700 dark:text-brand-400 mb-1">💡 Conseil pro</p>
                <p className="text-theme-xs text-brand-600/80 dark:text-brand-400/70">
                  Créez une tâche pour chaque suivi client important. Associez-la à un contact CRM pour garder une traçabilité complète de vos interactions.
                </p>
              </div>
            </div>

            <div className="px-6 pb-5">
              <button onClick={() => setIsOpen(false)} className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                Compris, merci !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
