/**
 * @fichier hooks/useAuth.ts
 * @rôle Hook d'authentification — lit/écrit l'état de session dans localStorage.
 *       Utilisé par MiniCart et d'autres composants pour vérifier si l'utilisateur
 *       est connecté avant d'afficher du contenu protégé.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AuthUser {
  id: string
  prenom: string
  nom: string
  role: 'admin' | 'client'
}

const AUTH_KEY = 'wog_auth'

/**
 * Lit la session courante depuis localStorage.
 * Retourne null si aucune session ou si exécuté côté serveur.
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

/**
 * Sauvegarde la session dans localStorage.
 */
export function saveAuthUser(user: AuthUser): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

/**
 * Supprime la session de localStorage.
 */
export function clearAuthUser(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_KEY)
}

/**
 * Hook React — abonne le composant à l'état de session.
 * Se synchronise automatiquement avec les changements localStorage.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setUser(getAuthUser())
    setLoaded(true)

    /* Écoute les changements de session depuis d'autres onglets */
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const logout = useCallback(() => {
    clearAuthUser()
    setUser(null)
  }, [])

  return { user, loaded, isAuthenticated: !!user, logout }
}
