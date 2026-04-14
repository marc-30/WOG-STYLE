/**
 * @fichier hooks/useScrollHeader.ts
 * @rôle Hook personnalisé gérant le comportement sticky et compressé du header au scroll.
 *        Détecte la position de défilement de la page et expose des états booléens
 *        permettant au Header de modifier son apparence (hauteur, ombre, fond).
 * @dépendances react
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/* ============================================================
 * CONSTANTES DE SEUIL
 * Valeurs de défilement en pixels déclenchant les transitions visuelles
 * ============================================================ */

/** Seuil à partir duquel le header devient "scrollé" (compressé) */
const SCROLL_THRESHOLD_COMPACT = 80

/** Seuil à partir duquel on considère que l'utilisateur scrolle activement */
const SCROLL_THRESHOLD_ACTIVE = 10

/* ============================================================
 * INTERFACE DE RETOUR DU HOOK
 * ============================================================ */

/**
 * Interface décrivant les valeurs exposées par le hook useScrollHeader.
 */
interface ScrollHeaderState {
  /** true si la page a été scrollée au-delà du seuil COMPACT (header compressé) */
  isScrolled: boolean
  /** true si l'utilisateur scrolle vers le bas (header peut être masqué) */
  isScrollingDown: boolean
  /** true si l'utilisateur scrolle vers le haut (header réapparaît) */
  isScrollingUp: boolean
  /** Position de scroll actuelle en pixels */
  scrollY: number
}

/* ============================================================
 * HOOK PRINCIPAL
 * ============================================================ */

/**
 * Hook useScrollHeader — gestion du comportement visuel du header au défilement.
 *
 * Écoute l'événement scroll de la fenêtre et calcule les états dérivés
 * nécessaires au Header pour adapter son rendu.
 *
 * Performance : utilise requestAnimationFrame pour throttler les callbacks
 * et éviter les re-rendus excessifs lors du scroll.
 *
 * @returns Objet contenant les états de défilement du header
 */
export function useScrollHeader(): ScrollHeaderState {
  /* Position de scroll actuelle */
  const [scrollY, setScrollY] = useState<number>(0)

  /* Direction du défilement */
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false)
  const [isScrollingUp, setIsScrollingUp] = useState<boolean>(false)

  /* Référence pour mémoriser la dernière position sans déclencher de rendu */
  const lastScrollY = useRef<number>(0)

  /* Référence pour le frame requestAnimationFrame en cours */
  const ticking = useRef<boolean>(false)

  /**
   * Traite la position de scroll et met à jour les états.
   * Cette fonction est appelée dans un contexte requestAnimationFrame.
   *
   * @param currentScrollY - Position de scroll actuelle en pixels
   */
  const processScroll = useCallback((currentScrollY: number) => {
    const previousScrollY = lastScrollY.current
    const delta = currentScrollY - previousScrollY

    /* Mise à jour de la position actuelle */
    setScrollY(currentScrollY)

    /* Détection de la direction uniquement si le delta est significatif */
    if (Math.abs(delta) > SCROLL_THRESHOLD_ACTIVE) {
      setIsScrollingDown(delta > 0)
      setIsScrollingUp(delta < 0)
    }

    /* Mémorisation de la position pour le prochain événement */
    lastScrollY.current = currentScrollY
    ticking.current = false
  }, [])

  /**
   * Handler de l'événement scroll natif du navigateur.
   * Utilise requestAnimationFrame pour limiter la fréquence d'exécution
   * et éviter les calculs redondants lors d'un scroll rapide.
   */
  const handleScroll = useCallback(() => {
    /* Annulation du traitement si un frame est déjà en attente */
    if (ticking.current) return

    /* Planification du traitement dans le prochain frame d'animation */
    requestAnimationFrame(() => {
      processScroll(window.scrollY)
    })

    ticking.current = true
  }, [processScroll])

  /* ============================================================
   * EFFET D'ABONNEMENT À L'ÉVÉNEMENT SCROLL
   * Abonnement au montage du composant, désabonnement au démontage.
   * L'option `passive: true` améliore les performances sur mobile.
   * ============================================================ */
  useEffect(() => {
    /* Initialisation avec la position de scroll actuelle au montage */
    setScrollY(window.scrollY)
    lastScrollY.current = window.scrollY

    /* Abonnement à l'événement scroll */
    window.addEventListener('scroll', handleScroll, { passive: true })

    /* Désabonnement au démontage pour éviter les fuites mémoire */
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return {
    /* Le header est considéré "scrollé" une fois le seuil COMPACT dépassé */
    isScrolled: scrollY > SCROLL_THRESHOLD_COMPACT,
    isScrollingDown,
    isScrollingUp,
    scrollY,
  }
}
