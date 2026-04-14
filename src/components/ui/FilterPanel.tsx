/**
 * @fichier components/ui/FilterPanel.tsx
 * @rôle Panneau de filtres latéral pour la page liste de produits.
 *        Contient des accordéons de filtres (Marque, Taille, Couleur, Prix, Genre).
 *        Responsive : panneau latéral sur desktop, drawer depuis le bas sur mobile.
 * @dépendances react, framer-motion, hooks/useFilters, components/ui/Accordion
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import brandsData from '@/data/brands.json'
import type { Brand } from '@/types'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant FilterPanel.
 */
interface FilterPanelProps {
  /** Filtres de marques sélectionnées */
  selectedBrands: string[]
  /** Filtres de tailles sélectionnées */
  selectedSizes: string[]
  /** Filtres de couleurs sélectionnées */
  selectedColors: string[]
  /** Fourchette de prix [min, max] */
  priceRange: [number, number]
  /** Genres sélectionnés */
  selectedGenres: string[]
  /** Callback pour basculer une marque */
  onToggleBrand: (brandId: string) => void
  /** Callback pour basculer une taille */
  onToggleSize: (size: string) => void
  /** Callback pour basculer une couleur */
  onToggleColor: (color: string) => void
  /** Callback pour mettre à jour la fourchette de prix */
  onSetPriceRange: (range: [number, number]) => void
  /** Callback pour basculer un genre */
  onToggleGenre: (genre: import('@/types').Genre) => void
  /** Callback pour réinitialiser tous les filtres */
  onReset: () => void
  /** Nombre total de filtres actifs */
  activeFilterCount: number
  /** Indique si le panel mobile est ouvert */
  isMobileOpen?: boolean
  /** Callback pour fermer le panel mobile */
  onMobileClose?: () => void
}

/* ============================================================
 * DONNÉES STATIQUES DES FILTRES
 * ============================================================ */

/** Tailles proposées dans les filtres */
const AVAILABLE_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '36', '37', '38', '39', '40', '41', '42', '43', '44', '45',
]

/** Couleurs proposées dans les filtres */
const AVAILABLE_COLORS = [
  { label: 'Noir', value: 'noir', hex: '#000000' },
  { label: 'Blanc', value: 'blanc', hex: '#FFFFFF' },
  { label: 'Gris', value: 'gris', hex: '#9B9B9B' },
  { label: 'Bleu', value: 'bleu', hex: '#1a3a6b' },
  { label: 'Rouge', value: 'rouge', hex: '#E53935' },
  { label: 'Vert', value: 'vert', hex: '#2e7d32' },
  { label: 'Beige', value: 'beige', hex: '#d4c5a9' },
  { label: 'Marron', value: 'marron', hex: '#5c4a32' },
]

/** Options de genre pour les filtres */
const GENRE_OPTIONS = [
  { label: 'Homme', value: 'men' },
  { label: 'Femme', value: 'women' },
]

/* ============================================================
 * SOUS-COMPOSANT : SECTION DE FILTRE
 * Accordéon réutilisable pour chaque groupe de filtres
 * ============================================================ */

/**
 * FilterSection — accordéon réutilisable pour encadrer un groupe de filtres.
 *
 * @param title      - Titre du groupe (ex. "Marque")
 * @param children   - Options de filtres à afficher
 * @param defaultOpen - Ouvert par défaut
 */
const FilterSection: React.FC<{
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="border-b border-end-gray-border">
      {/* Header cliquable de la section */}
      <button
        type="button"
        className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-end-black">
          {title}
        </span>
        {/* Chevron animé */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>

      {/* Contenu animé */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * FilterPanel — panneau de filtres latéral.
 *
 * Sur desktop : sidebar fixe à gauche de la grille produit.
 * Sur mobile : drawer depuis le bas déclenché par un bouton.
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedBrands,
  selectedSizes,
  selectedColors,
  priceRange,
  selectedGenres,
  onToggleBrand,
  onToggleSize,
  onToggleColor,
  onSetPriceRange,
  onToggleGenre,
  onReset,
  activeFilterCount,
  isMobileOpen = false,
  onMobileClose,
}) => {
  /* Contenu partagé entre desktop et mobile */
  const panelContent = (
    <div className="w-full">

      {/* === EN-TÊTE DU PANNEAU DE FILTRES === */}
      <div className="flex items-center justify-between py-4 border-b border-end-gray-border">
        <span className="text-xs font-bold uppercase tracking-widest">
          Filtres
          {/* Badge nombre de filtres actifs */}
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-end-black text-end-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </span>

        {/* Bouton de réinitialisation (visible uniquement si des filtres sont actifs) */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs underline underline-offset-2 text-end-gray-dark hover:text-end-black transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* === FILTRE PAR GENRE === */}
      <FilterSection title="Genre">
        <div className="space-y-2">
          {GENRE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Case à cocher personnalisée */}
              <span
                className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedGenres.includes(option.value)
                    ? 'bg-end-black border-end-black'
                    : 'border-end-gray-border group-hover:border-end-black'
                }`}
                onClick={() => onToggleGenre(option.value as import('@/types').Genre)}
              >
                {selectedGenres.includes(option.value) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedGenres.includes(option.value)}
                onChange={() => onToggleGenre(option.value as import('@/types').Genre)}
              />
              <span className="text-sm text-end-gray-dark group-hover:text-end-black transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* === FILTRE PAR MARQUE === */}
      <FilterSection title="Marque">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(brandsData as Brand[]).map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span
                className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedBrands.includes(brand.id)
                    ? 'bg-end-black border-end-black'
                    : 'border-end-gray-border group-hover:border-end-black'
                }`}
                onClick={() => onToggleBrand(brand.id)}
              >
                {selectedBrands.includes(brand.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedBrands.includes(brand.id)}
                onChange={() => onToggleBrand(brand.id)}
              />
              <span className="text-sm text-end-gray-dark group-hover:text-end-black transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* === FILTRE PAR TAILLE === */}
      <FilterSection title="Taille">
        {/* Grille de tailles avec indication sélection */}
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onToggleSize(size)}
              className={`px-2.5 py-1.5 text-xs border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-end-black text-end-white border-end-black'
                  : 'border-end-gray-border text-end-gray-dark hover:border-end-black hover:text-end-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* === FILTRE PAR COULEUR === */}
      <FilterSection title="Couleur">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onToggleColor(color.value)}
              title={color.label}
              aria-label={`Filtrer par couleur ${color.label}`}
              className={`relative w-7 h-7 rounded-full border-2 transition-all ${
                selectedColors.includes(color.value)
                  ? 'border-end-black scale-110'
                  : 'border-transparent hover:border-end-gray-mid'
              }`}
            >
              {/* Cercle coloré */}
              <span
                className="absolute inset-0.5 rounded-full"
                style={{ backgroundColor: color.hex }}
              />
              {/* Bordure intérieure pour le blanc */}
              {color.value === 'blanc' && (
                <span className="absolute inset-0.5 rounded-full border border-end-gray-border" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* === FILTRE PAR PRIX === */}
      <FilterSection title="Prix">
        <div className="space-y-3">
          {/* Affichage de la fourchette sélectionnée */}
          <div className="flex items-center justify-between text-xs text-end-gray-dark">
            <span>{priceRange[0]} €</span>
            <span>{priceRange[1]} €</span>
          </div>

          {/* Slider de prix minimum */}
          <div className="space-y-1">
            <label className="text-xs text-end-gray-mid">Prix minimum</label>
            <input
              type="range"
              min={0}
              max={500}
              value={priceRange[0]}
              onChange={(e) =>
                onSetPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-full accent-end-black"
            />
          </div>

          {/* Slider de prix maximum */}
          <div className="space-y-1">
            <label className="text-xs text-end-gray-mid">Prix maximum</label>
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[1]}
              onChange={(e) =>
                onSetPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-end-black"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* === VERSION DESKTOP : sidebar statique === */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        {panelContent}
      </aside>

      {/* === VERSION MOBILE : drawer depuis le bas ===
          Visible uniquement sur mobile et tablette */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay semi-transparent derrière le drawer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-70"
              onClick={onMobileClose}
            />

            {/* Drawer mobile depuis le bas */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-end-white z-70 max-h-[80vh] overflow-y-auto rounded-t-lg"
            >
              {/* Poignée visuelle du drawer mobile */}
              <div className="flex justify-center pt-3 pb-1">
                <span className="w-10 h-1 rounded-full bg-end-gray-border" />
              </div>

              <div className="px-4 pb-8">
                {/* Bouton de fermeture en haut à droite */}
                <div className="flex justify-end py-2">
                  <button
                    onClick={onMobileClose}
                    className="p-2"
                    aria-label="Fermer les filtres"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 2L14 14M14 2L2 14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                {panelContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default FilterPanel
