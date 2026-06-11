'use client'
/**
 * /admin/setup — Page de configuration du premier compte admin.
 * Accessible sans authentification. Protégée par ADMIN_SETUP_KEY.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ prenom: 'Admin', nom: 'WOG', email: 'admin@wog-style.com', telephone: '', motDePasse: 'WogStyle2026!', setupKey: 'wog-admin-setup-2026' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setOk(true)
        setMsg(data.message)
        setTimeout(() => router.push('/admin'), 2000)
      } else {
        setMsg(data.error || 'Erreur.')
      }
    } catch { setMsg('Erreur réseau.') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white font-black text-xl mb-4">W</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configuration Admin</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Activez ou créez votre compte administrateur WOG</p>
        </div>

        {ok ? (
          <div className="rounded-2xl bg-success-50 dark:bg-success-500/15 border border-success-200 dark:border-success-500/20 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success-600"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p className="font-semibold text-success-700 dark:text-success-400">{msg}</p>
            <p className="text-sm text-success-600 dark:text-success-500 mt-1">Redirection vers le tableau de bord...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              <strong>Comment ça marche :</strong> Si vous avez déjà un compte WOG, entrez votre email/téléphone et mot de passe existants + la clé de configuration. Votre rôle sera mis à jour en Admin. Sinon, remplissez tous les champs pour créer un nouveau compte admin.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['Prénom', 'prenom', 'Jean'], ['Nom', 'nom', 'Dupont']].map(([l, k, p]) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{l} <span className="text-gray-400">(nouveau compte)</span></label>
                    <input type="text" placeholder={p} value={form[k as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" placeholder="admin@wog-style.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input type="tel" placeholder="05 85 49 48 48" value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe *</label>
                <input type="password" placeholder="••••••••" value={form.motDePasse}
                  onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Clé de configuration *</label>
                <input type="password" placeholder="Clé secrète ADMIN_SETUP_KEY" value={form.setupKey}
                  onChange={e => setForm(f => ({ ...f, setupKey: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                <p className="text-xs text-gray-400 mt-1">Valeur par défaut : <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">wog-admin-setup-2026</code></p>
              </div>

              {msg && !ok && (
                <p className="text-sm text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-500/10 px-3 py-2 rounded-lg">{msg}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors">
                {loading ? 'Configuration...' : 'Activer le compte admin'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
