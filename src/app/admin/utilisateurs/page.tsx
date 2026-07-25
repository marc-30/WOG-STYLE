'use client'
import { useState, useEffect } from 'react'
import Badge from '../_components/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../_components/Table'

interface User {
  id: string; prenom: string; nom: string; email: string | null
  telephone: string | null; role: 'CLIENT' | 'ADMIN'; actif: boolean; createdAt: string
  _count?: { commandes: number }
}

type Tab = 'liste' | 'creer'

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('liste')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')

  // Formulaire création
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', motDePasse: '', role: 'CLIENT' as 'CLIENT' | 'ADMIN' })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/utilisateurs')
      if (res.ok) { const data = await res.json(); setUsers(data.users || []) }
    } catch { setUsers([]) }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 4000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.prenom || !form.nom || !form.motDePasse || (!form.email && !form.telephone)) {
      showMsg('Champs obligatoires manquants.', 'err'); return
    }
    const res = await fetch('/api/admin/utilisateurs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      showMsg('Utilisateur créé avec succès.')
      setForm({ prenom: '', nom: '', email: '', telephone: '', motDePasse: '', role: 'CLIENT' })
      setTab('liste'); fetchUsers()
    } else {
      const d = await res.json().catch(() => ({}))
      showMsg(d.error || 'Erreur lors de la création.', 'err')
    }
  }

  const handleUpdate = async () => {
    if (!editUser) return
    const res = await fetch(`/api/admin/utilisateurs/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prenom: editUser.prenom, nom: editUser.nom, email: editUser.email, telephone: editUser.telephone, role: editUser.role, actif: editUser.actif }),
    })
    if (res.ok) { showMsg('Utilisateur modifié.'); setShowEdit(false); fetchUsers() }
    else showMsg('Erreur de modification.', 'err')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return
    const res = await fetch(`/api/admin/utilisateurs/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (res.ok) { showMsg('Utilisateur supprimé.'); fetchUsers() }
    else showMsg(data.error || 'Erreur de suppression.', 'err')
  }

  const admins = users.filter(u => u.role === 'ADMIN')
  const clients = users.filter(u => u.role === 'CLIENT')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">Utilisateurs</h1>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {admins.length} admin{admins.length > 1 ? 's' : ''} · {clients.length} client{clients.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setTab('creer')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-colors shadow-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          <span className="hidden sm:inline">Nouvel utilisateur</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-theme-sm font-medium ${msgType === 'ok' ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400' : 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400'}`}>
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {(['liste', 'creer'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-4 text-theme-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90'}`}>
            {t === 'liste' ? 'Liste des utilisateurs' : 'Créer un utilisateur'}
          </button>
        ))}
      </div>

      {/* ── Liste ── */}
      {tab === 'liste' && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-theme-sm text-gray-400 dark:text-gray-500">
              Aucun utilisateur pour le moment.
            </div>
          ) : (
            <>
              {/* ── Vue mobile : cards ── */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 lg:hidden">
                {users.map(u => (
                  <div key={u.id} className="px-4 py-4 space-y-2.5">
                    {/* Ligne 1 : nom + badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-light text-gray-500 dark:text-gray-400 leading-none mb-0.5">
                          {u.prenom}
                        </p>
                        <p className="text-base font-semibold text-gray-800 dark:text-white/90 leading-tight truncate">
                          {u.nom.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        <Badge size="sm" color={u.role === 'ADMIN' ? 'primary' : 'light'}>
                          {u.role}
                        </Badge>
                        <Badge size="sm" color={u.actif ? 'success' : 'error'}>
                          {u.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>

                    {/* Ligne 2 : contact */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {u.email || u.telephone || '—'}
                    </p>

                    {/* Ligne 3 : méta + actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 dark:text-gray-600">
                        {u._count?.commandes ?? 0} commande{(u._count?.commandes ?? 0) !== 1 ? 's' : ''}
                        {' · '}
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setEditUser({ ...u }); setShowEdit(true) }}
                          className="text-xs font-medium text-brand-500 dark:text-brand-400"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-xs font-medium text-red-400 dark:text-red-400"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bannière mobile → desktop */}
              <div className="lg:hidden px-4 py-3 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Pour une vue complète (contact, historique…), ouvre le panneau depuis ton ordinateur.
                </p>
              </div>

              {/* ── Vue desktop : tableau ── */}
              <div className="hidden lg:block max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50 dark:bg-white/[0.02]">
                    <TableRow>
                      {['Utilisateur', 'Contact', 'Rôle', 'Statut', 'Commandes', 'Inscription', 'Actions'].map(h => (
                        <TableCell key={h} isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map(u => (
                      <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${u.role === 'ADMIN' ? 'bg-brand-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
                              {u.prenom[0]}{u.nom[0]}
                            </div>
                            <div>
                              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{u.prenom} {u.nom}</p>
                              <p className="text-theme-xs text-gray-400 dark:text-gray-500">{u.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <p className="text-theme-sm text-gray-600 dark:text-gray-300">{u.email || '—'}</p>
                          <p className="text-theme-xs text-gray-400 dark:text-gray-500">{u.telephone || '—'}</p>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge size="sm" color={u.role === 'ADMIN' ? 'primary' : 'light'}>{u.role}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge size="sm" color={u.actif ? 'success' : 'error'}>{u.actif ? 'Actif' : 'Inactif'}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-theme-sm text-gray-600 dark:text-gray-300">{u._count?.commandes ?? 0}</TableCell>
                        <TableCell className="px-4 py-3 text-theme-xs text-gray-400 dark:text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditUser({ ...u }); setShowEdit(true) }}
                              className="text-theme-xs text-brand-500 hover:text-brand-700 font-medium dark:text-brand-400">
                              Modifier
                            </button>
                            <span className="text-gray-200 dark:text-gray-700">|</span>
                            <button onClick={() => handleDelete(u.id)}
                              className="text-theme-xs text-error-500 hover:text-error-700 font-medium dark:text-error-400">
                              Supprimer
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Créer ── */}
      {tab === 'creer' && (
        <div className="max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">Créer un utilisateur</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['Prénom *', 'prenom', 'text', 'Jean'], ['Nom *', 'nom', 'text', 'Dupont']].map(([l, k, t, p]) => (
                  <div key={k}>
                    <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{l}</label>
                    <input type={t} placeholder={p} value={form[k as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" placeholder="jean@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input type="tel" placeholder="05 85 49 48 48" value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe * (min 8 caractères)</label>
                <input type="password" placeholder="••••••••" value={form.motDePasse}
                  onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} minLength={8}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'CLIENT' | 'ADMIN' }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
                  <option value="CLIENT">Client</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                  Créer l'utilisateur
                </button>
                <button type="button" onClick={() => setTab('liste')}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal modification */}
      {showEdit && editUser && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Modifier l'utilisateur</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[['Prénom', 'prenom'], ['Nom', 'nom']].map(([l, k]) => (
                  <div key={k}>
                    <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{l}</label>
                    <input type="text" value={editUser[k as 'prenom' | 'nom']}
                      onChange={e => setEditUser(u => u ? { ...u, [k]: e.target.value } : u)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={editUser.email || ''}
                  onChange={e => setEditUser(u => u ? { ...u, email: e.target.value || null } : u)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input type="tel" value={editUser.telephone || ''}
                  onChange={e => setEditUser(u => u ? { ...u, telephone: e.target.value || null } : u)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                  <select value={editUser.role} onChange={e => setEditUser(u => u ? { ...u, role: e.target.value as 'CLIENT' | 'ADMIN' } : u)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
                    <option value="CLIENT">Client</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select value={editUser.actif ? 'actif' : 'inactif'} onChange={e => setEditUser(u => u ? { ...u, actif: e.target.value === 'actif' } : u)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400">
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleUpdate} className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                Enregistrer
              </button>
              <button onClick={() => setShowEdit(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
