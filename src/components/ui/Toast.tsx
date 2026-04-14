/**
 * @fichier components/ui/Toast.tsx
 * @rôle Système de notifications toast animées pour les retours utilisateur.
 *        Affiché après ajout au panier, erreurs et confirmations d'actions.
 *        Utilise Framer Motion pour les animations d'entrée/sortie.
 *        Gère automatiquement la disparition après un délai configurable.
 * @dépendances react, framer-motion
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ToastConfig } from '@/types'

/* ============================================================
 * CONTEXTE TOAST
 * Permet à tout composant de l'arbre React d'afficher un toast
 * sans prop-drilling, via le hook useToast()
 * ============================================================ */

/**
 * Interface du contexte toast exposant la fonction d'affichage.
 */
interface ToastContextValue {
  /** Affiche un toast avec la configuration fournie */
  showToast: (config: Omit<ToastConfig, 'id'>) => void
}

/** Contexte React pour le système de toasts */
const ToastContext = createContext<ToastContextValue | null>(null)

/* ============================================================
 * HOOK useToast
 * ============================================================ */

/**
 * Hook useToast — accès au contexte toast depuis n'importe quel composant.
 *
 * @throws Erreur si utilisé hors d'un ToastProvider
 * @returns Objet contenant la fonction showToast
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider')
  }
  return context
}

/* ============================================================
 * VARIANTES D'ANIMATION FRAMER MOTION
 * Animation d'entrée depuis le bas, sortie vers le bas
 * ============================================================ */

/** Variants pour l'animation du toast */
const toastVariants = {
  /* État initial : invisible et décalé vers le bas */
  initial: { opacity: 0, y: 50, scale: 0.95 },
  /* État visible : pleine opacité, position normale */
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  /* État de sortie : disparition vers le bas */
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

/* ============================================================
 * ICÔNES SVG PAR TYPE DE TOAST
 * ============================================================ */

/**
 * Retourne l'icône SVG appropriée selon le type de toast.
 *
 * @param type - Type du toast ('success' | 'error' | 'info')
 * @returns Élément SVG React
 */
const ToastIcon: React.FC<{ type: ToastConfig['type'] }> = ({ type }) => {
  if (type === 'success') {
    return (
      /* Icône checkmark pour les succès */
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6 10L9 13L14 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'error') {
    return (
      /* Icône croix pour les erreurs */
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 7L13 13M13 7L7 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  /* Icône info par défaut */
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

/* ============================================================
 * COMPOSANT TOAST INDIVIDUEL
 * ============================================================ */

/**
 * Composant représentant un toast individuel avec animation.
 * Supprime automatiquement le toast après la durée spécifiée.
 *
 * @param toast      - Configuration du toast à afficher
 * @param onRemove   - Callback pour supprimer le toast du tableau
 */
const ToastItem: React.FC<{
  toast: ToastConfig
  onRemove: (id: string) => void
}> = ({ toast, onRemove }) => {
  /* Déclenchement de la suppression après la durée configurée */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration ?? 4000)

    /* Nettoyage du timer si le composant est démonté avant la fin */
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  /* Classes de couleur selon le type */
  const typeClasses: Record<ToastConfig['type'], string> = {
    success: 'bg-end-black text-end-white',
    error: 'bg-end-red text-end-white',
    info: 'bg-end-gray-dark text-end-white',
  }

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex items-center gap-3 px-4 py-3 min-w-64 max-w-sm shadow-end-drawer ${typeClasses[toast.type]}`}
      /* Rôle ARIA alert pour l'annonce aux lecteurs d'écran */
      role="alert"
      aria-live="polite"
    >
      {/* Icône du toast */}
      <span className="flex-shrink-0">
        <ToastIcon type={toast.type} />
      </span>

      {/* Message du toast */}
      <p className="text-sm font-medium flex-1">{toast.message}</p>

      {/* Bouton de fermeture manuelle */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
        aria-label="Fermer la notification"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M1 1L13 13M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.div>
  )
}

/* ============================================================
 * FOURNISSEUR DU CONTEXTE TOAST
 * ============================================================ */

/**
 * ToastProvider — fournisseur du contexte toast pour l'application.
 * À placer en haut de l'arbre de composants (dans layout.tsx).
 *
 * Gère un tableau de toasts et le rendu de la zone d'affichage
 * positionnée en bas à droite de l'écran.
 *
 * @param children - Composants enfants de l'application
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  /* Tableau des toasts actifs */
  const [toasts, setToasts] = useState<ToastConfig[]>([])

  /**
   * Ajoute un nouveau toast au tableau.
   * Génère un ID unique basé sur le timestamp et un nombre aléatoire.
   *
   * @param config - Configuration du toast sans l'ID
   */
  const showToast = useCallback(
    (config: Omit<ToastConfig, 'id'>): void => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev, { ...config, id }])
    },
    []
  )

  /**
   * Supprime un toast du tableau par son ID.
   *
   * @param id - Identifiant du toast à supprimer
   */
  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {/* Rendu des enfants de l'application */}
      {children}

      {/* === ZONE D'AFFICHAGE DES TOASTS ===
          Positionnée en bas à droite, z-index 80 pour passer au-dessus de tout */}
      <div
        className="fixed bottom-6 right-6 z-80 flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            /* pointer-events-auto pour que les toasts individuels soient cliquables */
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
