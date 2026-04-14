/**
 * @fichier components/product/ProductGrid.tsx
 * @rôle Grille responsive de cartes produit pour la page liste.
 *        Gère la barre de tri, le compteur de résultats, la pagination infinie
 *        et le bouton de filtre mobile. Layout : 2 colonnes mobile, 4 colonnes desktop.
 * @dépendances react, components/product/ProductCard, types/index
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import type { Product, SortOption } from '@/types'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant ProductGrid.
 */
interface ProductGridProps {
  /** Liste complète des produits filtrés et triés */
  products: Product[]
  /** Nombre total de résultats (avant pagination) */
  totalResults: number
  /** Option de tri sélectionnée */
  sortBy: SortOption
  /** Callback de changement de tri */
  onSortChange: (sort: SortOption) => void
  /** Nombre de filtres actifs (pour le badge sur le bouton mobile) */
  activeFilterCount?: number
  /** Callback pour ouvrir le panel de filtres mobile */
  onOpenMobileFilters?: () => void
}

/* ============================================================
 * CONSTANTES DE PAGINATION
 * ============================================================ */

/** Nombre de produits chargés par page (pagination infinie) */
const PAGE_SIZE = 8

/* ============================================================
 * OPTIONS DE TRI
 * Labels affichés dans le sélecteur de tri
 * ============================================================ */

/** Options du sélecteur de tri avec leur valeur et libellé */
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price_asc', label: 'Prix : croissant' },
  { value: 'price_desc', label: 'Prix : décroissant' },
  { value: 'relevance', label: 'Pertinence' },
]

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * ProductGrid — grille de produits avec contrôles de tri et pagination infinie.
 *
 * La pagination infinie est implémentée via IntersectionObserver :
 * un élément sentinelle en bas de grille déclenche le chargement
 * de la tranche suivante de produits lorsqu'il devient visible.
 *
 * @param products           - Produits filtrés à afficher
 * @param totalResults       - Nombre total de résultats
 * @param sortBy             - Option de tri active
 * @param onSortChange       - Handler de changement de tri
 * @param activeFilterCount  - Nombre de filtres actifs
 * @param onOpenMobileFilters - Handler d'ouverture du panel mobile
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  totalResults,
  sortBy,
  onSortChange,
  activeFilterCount = 0,
  onOpenMobileFilters,
}) => {
  /* Nombre de produits actuellement affichés (pagination infinie) */
  const [displayCount, setDisplayCount] = useState<number>(PAGE_SIZE)

  /* Référence vers l'élément sentinelle en bas de grille */
  const sentinelRef = useRef<HTMLDivElement>(null)

  /* Produits visibles actuellement (slice du tableau complet) */
  const visibleProducts = products.slice(0, displayCount)

  /* Indicateur de chargement de la tranche suivante */
  const hasMore = displayCount < products.length

  /* ============================================================
   * RÉINITIALISATION DU NOMBRE D'ITEMS AFFICHÉS
   * Quand les filtres changent, on repart de la première page
   * ============================================================ */
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [products])

  /* ============================================================
   * INTERSECTION OBSERVER — PAGINATION INFINIE
   * Charge la tranche suivante quand la sentinelle est visible
   * ============================================================ */

  /**
   * Callback déclenché par l'IntersectionObserver.
   * Charge PAGE_SIZE produits supplémentaires lorsque la sentinelle est visible.
   */
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore) {
        setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, products.length))
      }
    },
    [hasMore, products.length]
  )

  /* Création et nettoyage de l'IntersectionObserver */
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      /* Déclenchement 200px avant que la sentinelle soit visible */
      rootMargin: '200px',
      threshold: 0,
    })

    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [handleIntersection])

  return (
    <div className="flex-1 min-w-0">

      {/* === BARRE DE CONTRÔLES (TRI + RÉSULTATS) ===
          Affiche le compteur de résultats et le sélecteur de tri */}
      <div className="flex items-center justify-between py-4 border-b border-end-gray-border mb-0">

        {/* Côté gauche : bouton filtres mobile + compteur de résultats */}
        <div className="flex items-center gap-4">

          {/* Bouton "Filtres" visible uniquement sur mobile/tablette */}
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-end-black px-3 py-2"
          >
            {/* Icône filtre SVG */}
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <path d="M1 1H13M3 6H11M5 11H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Filtres
            {/* Badge indiquant le nombre de filtres actifs */}
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 bg-end-black text-end-white text-2xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Compteur de résultats */}
          <span className="text-xs text-end-gray-mid">
            <strong className="text-end-black font-semibold">{totalResults}</strong>{' '}
            {totalResults === 1 ? 'produit' : 'produits'}
          </span>
        </div>

        {/* Côté droit : sélecteur de tri */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-select"
            className="text-xs text-end-gray-mid hidden sm:block"
          >
            Trier par :
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            /* Style minimaliste : fond transparent, bordure fine */
            className="text-xs font-semibold uppercase tracking-wider bg-transparent border border-end-gray-border px-3 py-2 appearance-none cursor-pointer hover:border-end-black transition-colors focus:outline-none focus:border-end-black"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* === GRILLE DE PRODUITS ===
          gap-px avec fond gris crée l'effet de grille avec séparateurs fins */}
      {products.length === 0 ? (
        /* Message d'état vide quand aucun produit ne correspond aux filtres */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="mb-4 text-end-gray-border"
          >
            <rect x="4" y="4" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 24H32M24 16V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-semibold uppercase tracking-widest text-end-black mb-2">
            Aucun résultat
          </p>
          <p className="text-sm text-end-gray-mid">
            Essayez de modifier vos filtres pour trouver plus de produits.
          </p>
        </div>
      ) : (
        <>
          {/* Grille avec séparateurs 1px entre cellules */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-end-gray-border">
            {visibleProducts.map((product, index) => (
              <div key={product.id} className="bg-end-white p-3">
                <ProductCard
                  product={product}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* === INDICATEUR DE CHARGEMENT / BOUTON VOIR PLUS ===
              Visible uniquement s'il reste des produits à charger */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-12"
            >
              {/* Spinner de chargement pendant le déclenchement de l'observer */}
              <div className="flex items-center gap-3 text-xs text-end-gray-mid uppercase tracking-widest">
                <span
                  className="w-4 h-4 border-2 border-end-gray-border border-t-end-black rounded-full animate-spin"
                  aria-hidden="true"
                />
                Chargement...
              </div>
            </div>
          )}

          {/* Message fin de liste */}
          {!hasMore && products.length > PAGE_SIZE && (
            <div className="flex items-center justify-center py-12 text-xs text-end-gray-mid uppercase tracking-widest">
              Tous les produits ont été chargés ({totalResults} articles)
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductGrid
