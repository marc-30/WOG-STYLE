'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ScrollHeaderState {
  isScrolled: boolean
  isScrollingDown: boolean
  isScrollingUp: boolean
  scrollY: number
}

// Seuil pour passer en mode "compact" (scrollé)
const THRESHOLD_DOWN = 80
// Seuil pour revenir en mode "normal" — zone morte pour éviter le tremblement
const THRESHOLD_UP = 50

export function useScrollHeader(): ScrollHeaderState {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const processScroll = useCallback((current: number) => {
    const prev = lastScrollY.current
    const delta = current - prev

    setScrollY(current)

    // Hysteresis : seuil différent selon la direction pour éviter le tremblement
    setIsScrolled(prev => {
      if (!prev && current > THRESHOLD_DOWN) return true
      if (prev && current < THRESHOLD_UP) return false
      return prev
    })

    // Direction — seulement si le mouvement est significatif (> 4px)
    if (Math.abs(delta) > 4) {
      setIsScrollingDown(delta > 0)
      setIsScrollingUp(delta < 0)
    }

    lastScrollY.current = current
    ticking.current = false
  }, [])

  const handleScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => processScroll(window.scrollY))
  }, [processScroll])

  useEffect(() => {
    const y = window.scrollY
    lastScrollY.current = y
    setScrollY(y)
    setIsScrolled(y > THRESHOLD_DOWN)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { isScrolled, isScrollingDown, isScrollingUp, scrollY }
}
