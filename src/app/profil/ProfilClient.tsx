'use client'

/**
 * @fichier app/profil/ProfilClient.tsx
 * @rôle Page profil — affiche les infos de l'utilisateur connecté.
 *       Redirige vers /connexion si non connecté.
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearAuthUser } from '@/hooks/useAuth'
import { useCartStore } from '@/store/cartStore'

interface UserProfile {
  id: string
  prenom: string
  nom: string
  email: string | null
  telephone: string | null
  role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: string
  _count: { commandes: number }
}

export const ProfilClient: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.replace('/connexion')
        } else {
          setUser(data.user)
        }
      })
      .catch(() => router.replace('/connexion'))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    useCartStore.getState().clearCart()
    clearAuthUser()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-end-black" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (!user) return null

  const estAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const initiales = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  const dateInscription = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-end-gray-light">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-8">
          <Link href="/" className="hover:text-end-black transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-end-black font-semibold">Mon profil</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

          {/* ── Carte identité ── */}
          <div className="lg:col-span-1">
            <div className="bg-end-white p-5 sm:p-6 text-center">

              {/* Avatar initiales */}
              <div className="w-20 h-20 rounded-full bg-end-black text-end-white text-2xl font-black flex items-center justify-center mx-auto mb-4">
                {initiales}
              </div>

              <h1 className="text-lg font-black uppercase tracking-tight text-end-black mb-1">
                {user.prenom} {user.nom}
              </h1>

              {/* Badge rôle */}
              <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 mb-4 ${
                estAdmin
                  ? 'bg-end-black text-end-white'
                  : 'bg-end-gray-light text-end-gray-dark border border-end-gray-border'
              }`}>
                {user.role === 'SUPER_ADMIN' ? 'Administrateur principal' : user.role === 'ADMIN' ? 'Administrateur' : 'Client'}
              </span>

              <div className="space-y-2 text-xs text-end-gray-dark text-left border-t border-end-gray-border pt-4">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                      <rect x="1" y="2.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M1 4l5 3 5-3" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {user.telephone && (
                  <div className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                      <rect x="3" y="1" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="6" cy="9" r="0.6" fill="currentColor" />
                    </svg>
                    <span>{user.telephone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-end-gray-mid">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                    <rect x="1" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span>Membre depuis le {dateInscription}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                {estAdmin && (
                  <Link href="/admin"
                    className="block w-full bg-end-black text-end-white py-2.5 text-xs font-bold uppercase tracking-widest text-center hover:opacity-80 transition-opacity">
                    Dashboard Admin
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="block w-full border border-end-gray-border text-end-black py-2.5 text-xs font-bold uppercase tracking-widest text-center hover:border-end-black transition-colors">
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>

          {/* ── Contenu principal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Commandes', value: user._count.commandes, icon: '📦' },
                { label: 'Points fidélité', value: user._count.commandes * 100, icon: '⭐' },
                { label: 'Statut', value: user._count.commandes >= 5 ? 'Gold' : 'Standard', icon: '🏅' },
              ].map((stat) => (
                <div key={stat.label} className="bg-end-white p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl mb-1">{stat.icon}</p>
                  <p className="text-base sm:text-lg font-black text-end-black">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-end-gray-mid uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Mes commandes */}
            <div className="bg-end-white p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-4">
                Mes commandes
              </h2>
              {user._count.commandes === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-end-gray-mid mb-4">Vous n'avez pas encore passé de commande.</p>
                  <Link href="/collection"
                    className="inline-flex items-center gap-2 bg-end-black text-end-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
                    Découvrir la collection
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-end-gray-mid">
                  {user._count.commandes} commande{user._count.commandes > 1 ? 's' : ''} passée{user._count.commandes > 1 ? 's' : ''}.
                </p>
              )}
            </div>

            {/* Liens rapides */}
            <div className="bg-end-white p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-4">
                Liens rapides
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {[
                  { href: '/collection', label: 'Explorer les collections' },
                  { href: '/paiement', label: 'Passer une commande' },
                  { href: '/contact', label: 'Contacter le service client' },
                  { href: '/about', label: 'À propos de WOG-STYLE' },
                ].map((link) => (
                  <Link key={link.href} href={link.href}
                    className="flex items-center justify-between p-3 border border-end-gray-border hover:border-end-black transition-colors text-xs font-semibold text-end-black uppercase tracking-wider">
                    {link.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilClient
