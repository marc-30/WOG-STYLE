/**
 * @fichier components/layout/Header.tsx
 * @rôle En-tête principal sticky de WOG-STYLE.
 *       Responsive : menu hamburger mobile + drawer, desktop mega-menu.
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollHeader } from '@/hooks/useScrollHeader'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { MegaMenu, NAV_ITEMS } from './MegaMenu'
import type { NavItem } from '@/types'

/* ── Icônes SVG ─────────────────────────────────────────── */

const SearchIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const AccountIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const BagIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 6h10l-1.5 9H5.5L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6.5 6V4.5C6.5 3.12 7.62 2 9 2s2.5 1.12 2.5 2.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const HamburgerIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const CloseIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const WogLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img src="/images/logo.jpg" alt="WOG-STYLE" role="img" aria-label="WOG-STYLE — Accueil" className={`object-contain ${className}`} />
)

/* ── Composant principal ─────────────────────────────────── */

export const Header: React.FC = () => {
  const { isScrolled } = useScrollHeader()
  const { totalItems, toggleCart } = useCart()
  const { isAuthenticated } = useAuth()

  const [activeNavItem, setActiveNavItem] = useState<NavItem | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  /* Menu mobile */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  /* Mega-menu handlers */
  const handleNavItemEnter = useCallback((item: NavItem) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    if (item.hasMegaMenu) setActiveNavItem(item)
  }, [])

  const handleNavItemLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setActiveNavItem(null), 150)
  }, [])

  const handleMegaMenuEnter = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
  }, [])

  const handleMegaMenuLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setActiveNavItem(null), 150)
  }, [])

  const searchSuggestions =
    searchQuery.length > 1
      ? [`Nike ${searchQuery}`, `adidas ${searchQuery}`, `New Balance ${searchQuery}`, `${searchQuery} sneakers`]
      : []

  return (
    <header className={`sticky top-0 z-60 bg-end-white transition-shadow duration-250 ${isScrolled ? 'shadow-end-header' : ''}`}>

      {/* ── TopBar ── */}
      <div className="bg-end-black text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-9 gap-3">
            <span className="text-xs text-white/90 font-semibold hidden sm:block">📍 Abidjan, Côte d&apos;Ivoire</span>
            <span className="text-xs text-white/90 font-semibold hidden sm:block">|</span>
            <span className="text-xs text-white/90 font-semibold">+225 05 75 39 43 20</span>
          </div>
        </div>
      </div>

      {/* ── Main header row ── */}
      <div className={`border-b border-end-gray-border transition-all duration-250 ${isScrolled ? 'py-2' : 'py-3 sm:py-4'}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">

            {/* Gauche : hamburger mobile | spacer desktop */}
            <div className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Ouvrir le menu"
                className="lg:hidden text-end-black hover:opacity-60 transition-opacity p-1"
              >
                <HamburgerIcon />
              </button>
            </div>

            {/* Logo centré */}
            <Link href="/" className="flex-shrink-0" aria-label="WOG-STYLE — Accueil">
              <span className={`font-black uppercase tracking-tight text-end-black transition-all duration-250 ${isScrolled ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
                WOG STYLE
              </span>
            </Link>

            {/* Droite : icônes */}
            <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
              <button type="button" onClick={() => setIsSearchOpen((p) => !p)} aria-label="Rechercher"
                className="text-end-black hover:opacity-60 transition-opacity">
                <SearchIcon />
              </button>
              <Link href={isAuthenticated ? '/profil' : '/connexion'} aria-label="Mon compte"
                className="text-end-black hover:opacity-60 transition-opacity">
                <AccountIcon />
              </Link>
              <button type="button" onClick={toggleCart}
                aria-label={`Panier — ${totalItems} articles`}
                className="relative text-end-black hover:opacity-60 transition-opacity">
                <BagIcon />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-end-blue text-white text-2xs font-bold rounded-full flex items-center justify-center leading-none">
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }} className="bg-end-white border-b border-end-gray-border">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3 border-b border-end-black pb-2">
                <SearchIcon />
                <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une collection..."
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-end-gray-mid min-w-0" autoFocus />
                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery('') }}
                  className="text-xs uppercase tracking-wider text-end-gray-dark hover:text-end-black flex-shrink-0">
                  Fermer
                </button>
              </div>
              {searchSuggestions.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {searchSuggestions.map((s, i) => (
                    <li key={i}>
                      <button type="button"
                        className="flex items-center gap-2 text-sm text-end-gray-dark hover:text-end-black transition-colors py-1"
                        onClick={() => { setSearchQuery(s); setIsSearchOpen(false) }}>
                        <SearchIcon />{s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation desktop ── */}
      <nav className="border-b border-end-gray-border relative hidden lg:block"
        onMouseLeave={handleNavItemLeave} aria-label="Navigation principale">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onMouseEnter={() => handleNavItemEnter(item)}
                  className={`block px-4 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-100 ${
                    item.highlighted ? 'text-end-red hover:text-red-700' : 'text-end-black hover:opacity-60'
                  } ${activeNavItem?.label === item.label ? 'border-b-2 border-end-black pb-[11px]' : ''}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div onMouseEnter={handleMegaMenuEnter} onMouseLeave={handleMegaMenuLeave}>
          <MegaMenu activeItem={activeNavItem} />
        </div>
        <AnimatePresence>
          {activeNavItem?.hasMegaMenu && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-full bg-black/20 -z-10 pointer-events-none" />
          )}
        </AnimatePresence>
      </nav>

      {/* ── Menu mobile drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay flouté */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-70 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 h-screen w-[300px] max-w-[88vw] bg-white z-80 flex flex-col lg:hidden"
              role="dialog" aria-label="Menu principal" aria-modal="true"
            >
              {/* ── En-tête drawer : fond noir ── */}
              <div className="bg-end-black px-6 py-5 flex items-center justify-between flex-shrink-0">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-white font-black text-lg uppercase tracking-tight">WOG STYLE</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* ── Navigation ── */}
              <nav className="flex-1 overflow-y-auto">
                <ul>
                  {NAV_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.045, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center justify-between px-6 py-[15px] border-b border-end-gray-border/40 transition-all duration-150 hover:bg-end-black hover:text-white ${
                          item.highlighted ? 'text-end-red' : 'text-end-black'
                        }`}
                      >
                        <span className="text-[12px] font-bold uppercase tracking-[0.13em]">{item.label}</span>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
                          className="opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-150">
                          <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* ── Actions : compte + panier ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.06 + NAV_ITEMS.length * 0.045 + 0.05, duration: 0.2 }}
                  className="px-6 pt-6 pb-4 space-y-3"
                >
                  <Link
                    href={isAuthenticated ? '/profil' : '/connexion'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 border border-end-gray-border text-end-black hover:bg-end-black hover:text-white hover:border-end-black transition-all duration-150"
                  >
                    <AccountIcon />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Mon compte</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); toggleCart() }}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-end-black text-white hover:bg-end-black/80 transition-colors duration-150"
                  >
                    <BagIcon />
                    <span className="text-[11px] font-bold uppercase tracking-widest flex-1 text-left">Panier</span>
                    {totalItems > 0 && (
                      <span className="bg-white text-end-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </button>
                </motion.div>
              </nav>

              {/* ── Footer drawer ── */}
              <div className="bg-end-black px-6 py-4 flex-shrink-0">
                <p className="text-[10px] text-white/50 tracking-widest uppercase text-center">
                  Abidjan — Livraison gratuite dès 50 000 XOF
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
