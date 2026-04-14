/**
 * @fichier app/sneakers/SneakersClient.tsx
 * @rôle Partie interactive (Client Component) de la page liste des sneakers.
 *        Gère les filtres, le tri et l'affichage de la grille de produits.
 *        Séparé du Server Component page.tsx pour le streaming Next.js.
 * @dépendances react, hooks/useFilters, components/product/ProductGrid,
 *              components/ui/FilterPanel
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState } from 'react'
import { useFilters } from '@/hooks/useFilters'
import { ProductGrid } from '@/components/product/ProductGrid'
import { FilterPanel } from '@/components/ui/FilterPanel'

/* ============================================================
 * COMPOSANT CLIENT
 * ============================================================ */

/**
 * SneakersClient — composant interactif de la page liste sneakers.
 *
 * Layout :
 * - Sidebar filtres (desktop uniquement, 224px)
 * - Grille de produits (espace restant)
 *
 * Sur mobile : les filtres sont dans un drawer (via FilterPanel)
 */
export default function SneakersClient() {
  /* Hook de gestion des filtres — catégorie "sneakers" pré-filtrée */
  const {
    filters,
    filteredProducts,
    totalResults,
    activeFilterCount,
    toggleBrand,
    toggleSize,
    toggleColor,
    setPriceRange,
    toggleGenre,
    setSortBy,
    resetFilters,
  } = useFilters('sneakers')

  /* État d'ouverture du panel de filtres mobile */
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* === EN-TÊTE DE LA PAGE ===
          Titre de catégorie + fil d'Ariane */}
      <div className="mb-6">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="mb-2">
          <ol className="flex items-center gap-2 text-xs text-end-gray-mid">
            <li><a href="/" className="hover:text-end-black transition-colors">Accueil</a></li>
            <li aria-hidden="true">›</li>
            <li className="text-end-black font-medium">Sneakers</li>
          </ol>
        </nav>

        {/* Titre principal de la page */}
        <h1 className="text-2xl font-black uppercase tracking-tight text-end-black">
          Sneakers
        </h1>
      </div>

      {/* === LAYOUT PRINCIPAL : FILTRES + GRILLE ===
          Flexbox horizontal avec gap entre sidebar et grille */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">

        {/* Panneau de filtres — desktop sidebar + mobile drawer */}
        <FilterPanel
          selectedBrands={filters.brands}
          selectedSizes={filters.sizes}
          selectedColors={filters.colors}
          priceRange={filters.priceRange}
          selectedGenres={filters.genres}
          onToggleBrand={toggleBrand}
          onToggleSize={toggleSize}
          onToggleColor={toggleColor}
          onSetPriceRange={setPriceRange}
          onToggleGenre={toggleGenre}
          onReset={resetFilters}
          activeFilterCount={activeFilterCount}
          isMobileOpen={isMobileFiltersOpen}
          onMobileClose={() => setIsMobileFiltersOpen(false)}
        />

        {/* Grille de produits avec contrôles de tri */}
        <ProductGrid
          products={filteredProducts}
          totalResults={totalResults}
          sortBy={filters.sortBy}
          onSortChange={setSortBy}
          activeFilterCount={activeFilterCount}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        />
      </div>
    </div>
  )
}
