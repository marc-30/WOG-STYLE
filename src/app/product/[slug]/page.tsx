/**
 * @fichier app/product/[slug]/page.tsx
 * @rôle Page fiche produit dynamique (/product/[slug]).
 *        Affiche la galerie d'images, le sélecteur de taille, le bouton Add to Bag,
 *        les accordéons d'information et les produits similaires.
 * @dépendances react, next, components/product/*, components/ui/*, hooks/useCart,
 *              data/products.json
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import productsData from '@/data/products.json'
import type { Product } from '@/types'
import ProductDetailClient from './ProductDetailClient'

/* ============================================================
 * GÉNÉRATION DES PARAMÈTRES STATIQUES
 * Pre-génère toutes les routes /product/[slug] au build time
 * ============================================================ */

/**
 * Génère les paramètres statiques pour toutes les fiches produit.
 * Next.js pré-rend ces pages statiquement pour des performances maximales.
 *
 * @returns Tableau de paramètres { slug } pour chaque produit
 */
export async function generateStaticParams() {
  return (productsData as Product[]).map((product) => ({
    slug: product.slug,
  }))
}

/* ============================================================
 * GÉNÉRATION DES MÉTADONNÉES DYNAMIQUES
 * Chaque fiche produit a ses propres métadonnées SEO
 * ============================================================ */

/**
 * Génère les métadonnées SEO dynamiques pour une fiche produit.
 *
 * @param params - Paramètres de la route contenant le slug
 * @returns Objet Metadata Next.js
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  /* Recherche du produit par slug */
  const product = (productsData as Product[]).find((p) => p.slug === params.slug)

  if (!product) {
    return { title: 'Produit introuvable' }
  }

  return {
    title: `${product.brand} ${product.name}`,
    description: `${product.description.slice(0, 155)}...`,
    openGraph: {
      title: `${product.brand} ${product.name} — END. Clothing`,
      description: product.description.slice(0, 155),
      images: [product.mainImage.src],
    },
  }
}

/* ============================================================
 * COMPOSANT PAGE
 * ============================================================ */

/**
 * ProductPage — page fiche produit dynamique.
 *
 * @param params - Paramètres de route contenant le slug du produit
 */
export default function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  /* Recherche du produit dans les données statiques */
  const product = (productsData as Product[]).find((p) => p.slug === params.slug)

  /* Redirection vers 404 si le produit n'existe pas */
  if (!product) {
    notFound()
  }

  /* Produits similaires : même catégorie, différent ID, max 4 */
  const similarProducts = (productsData as Product[])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return <ProductDetailClient product={product} similarProducts={similarProducts} />
}
