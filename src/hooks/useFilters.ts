/**
 * @fichier hooks/useFilters.ts
 * @rôle Hook personnalisé pour la gestion des filtres et du tri de la liste produits.
 *        Synchronise les filtres actifs avec les paramètres d'URL via searchParams Next.js.
 *        Fournit les fonctions de mise à jour des filtres et les produits filtrés calculés.
 * @dépendances react, next/navigation, types/index, data/products.json
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import type { ActiveFilters, Product, SortOption, Genre } from '@/types'
import productsData from '@/data/products.json'

/* ============================================================
 * VALEURS PAR DÉFAUT DES FILTRES
 * État initial des filtres : aucun filtre actif, tri par nouveautés
 * ============================================================ */
const DEFAULT_FILTERS: ActiveFilters = {
  brands: [],
  sizes: [],
  colors: [],
  priceRange: [0, 1000],
  genres: [],
  sortBy: 'newest',
  searchQuery: '',
}

/* ============================================================
 * HOOK PRINCIPAL DES FILTRES
 * ============================================================ */

/**
 * Hook useFilters — gestion complète du système de filtres et de tri.
 *
 * Maintient l'état des filtres actifs et calcule les produits filtrés
 * et triés en temps réel via useMemo pour des performances optimales.
 *
 * @param initialCategory - Catégorie de page initiale (ex. "sneakers")
 * @returns Objet contenant les filtres actifs, les produits filtrés et les handlers
 */
export function useFilters(initialCategory?: string) {
  /* État local des filtres actifs */
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)

  /* ============================================================
   * CALCUL DES PRODUITS FILTRÉS ET TRIÉS (mémoïsé)
   * Ce calcul ne se ré-exécute que lorsque les filtres ou les données changent.
   * ============================================================ */
  const filteredProducts = useMemo(() => {
    /* Typage explicite des données importées */
    let result = productsData as Product[]

    /* --- Filtre par catégorie (déduit de la route) --- */
    if (initialCategory) {
      result = result.filter((p) => p.category === initialCategory)
    }

    /* --- Filtre par marques sélectionnées --- */
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brandId))
    }

    /* --- Filtre par tailles disponibles --- */
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some(
          (s) => filters.sizes.includes(s.value) && s.inStock
        )
      )
    }

    /* --- Filtre par couleurs --- */
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        filters.colors.some((c) =>
          p.color.toLowerCase().includes(c.toLowerCase())
        )
      )
    }

    /* --- Filtre par fourchette de prix --- */
    result = result.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    /* --- Filtre par genre --- */
    if (filters.genres.length > 0) {
      result = result.filter(
        (p) =>
          filters.genres.includes(p.genre as Genre) || p.genre === 'unisex' || p.genre === 'UNISEXE'
      )
    }

    /* --- Filtre par recherche textuelle --- */
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    /* --- Application du tri sélectionné --- */
    switch (filters.sortBy) {
      case 'newest':
        /* Tri par date d'ajout décroissante (plus récent en premier) */
        result = [...result].sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        )
        break

      case 'price_asc':
        /* Tri par prix croissant */
        result = [...result].sort((a, b) => a.price - b.price)
        break

      case 'price_desc':
        /* Tri par prix décroissant */
        result = [...result].sort((a, b) => b.price - a.price)
        break

      case 'relevance':
        /* Tri par pertinence : produits mis en avant en premier */
        result = [...result].sort((a, b) =>
          a.featured === b.featured ? 0 : a.featured ? -1 : 1
        )
        break
    }

    return result
  }, [filters, initialCategory])

  /* ============================================================
   * HANDLERS DE MISE À JOUR DES FILTRES
   * Chaque handler est mémoïsé avec useCallback pour éviter
   * les re-créations inutiles lors des rendus parents.
   * ============================================================ */

  /**
   * Bascule la sélection d'une marque dans les filtres actifs.
   * Si la marque est déjà sélectionnée, elle est retirée ; sinon elle est ajoutée.
   *
   * @param brandId - Identifiant de la marque à basculer
   */
  const toggleBrand = useCallback((brandId: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brandId)
        ? prev.brands.filter((b) => b !== brandId)
        : [...prev.brands, brandId],
    }))
  }, [])

  /**
   * Bascule la sélection d'une taille dans les filtres actifs.
   *
   * @param sizeValue - Valeur de la taille à basculer (ex. "42")
   */
  const toggleSize = useCallback((sizeValue: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(sizeValue)
        ? prev.sizes.filter((s) => s !== sizeValue)
        : [...prev.sizes, sizeValue],
    }))
  }, [])

  /**
   * Bascule la sélection d'une couleur dans les filtres actifs.
   *
   * @param color - Couleur à basculer
   */
  const toggleColor = useCallback((color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }))
  }, [])

  /**
   * Met à jour la fourchette de prix du filtre.
   *
   * @param range - Tableau [min, max] en euros
   */
  const setPriceRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }))
  }, [])

  /**
   * Bascule la sélection d'un genre dans les filtres actifs.
   *
   * @param genre - Genre à basculer ('men' | 'women' | 'unisex')
   */
  const toggleGenre = useCallback((genre: Genre) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }))
  }, [])

  /**
   * Modifie l'option de tri de la grille de produits.
   *
   * @param sortBy - Option de tri sélectionnée
   */
  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }))
  }, [])

  /**
   * Met à jour la requête de recherche textuelle.
   *
   * @param query - Terme de recherche saisi par l'utilisateur
   */
  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  /**
   * Réinitialise tous les filtres à leurs valeurs par défaut.
   * Équivalent à un "Effacer les filtres".
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  /* Calcul du nombre de filtres actifs (pour l'indicateur UI) */
  const activeFilterCount =
    filters.brands.length +
    filters.sizes.length +
    filters.colors.length +
    filters.genres.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0)

  return {
    /* --- ÉTAT DES FILTRES --- */
    filters,
    activeFilterCount,

    /* --- PRODUITS FILTRÉS --- */
    filteredProducts,
    totalResults: filteredProducts.length,

    /* --- HANDLERS --- */
    toggleBrand,
    toggleSize,
    toggleColor,
    setPriceRange,
    toggleGenre,
    setSortBy,
    setSearchQuery,
    resetFilters,
  }
}
