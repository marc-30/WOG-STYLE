/**
 * @fichier app/sneakers/page.tsx
 * @rôle Page liste de produits pour la catégorie Sneakers (/sneakers).
 *        Affiche la grille de produits filtrés et triés avec le panneau de filtres
 *        latéral sur desktop et en drawer sur mobile.
 * @dépendances react, hooks/useFilters, components/product/ProductGrid,
 *              components/ui/FilterPanel
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

import type { Metadata } from 'next'
import SneakersClient from './SneakersClient'

/* ============================================================
 * MÉTADONNÉES DE LA PAGE
 * ============================================================ */

/** Métadonnées SEO de la page liste sneakers */
export const metadata: Metadata = {
  title: 'Sneakers',
  description:
    'Découvrez notre sélection de sneakers Nike, adidas, New Balance, ASICS, Salomon et plus encore. Livraison express en France.',
}

/* ============================================================
 * COMPOSANT PAGE (Server Component)
 * ============================================================ */

/**
 * SneakersPage — page liste des sneakers.
 * Délègue le rendu interactif (filtres, tri) au Client Component SneakersClient.
 */
export default function SneakersPage() {
  return <SneakersClient />
}
