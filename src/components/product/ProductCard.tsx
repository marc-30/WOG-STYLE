/**
 * @fichier components/product/ProductCard.tsx
 * @rôle Carte produit utilisée dans la grille de la page liste et la page d'accueil.
 *        Gère le swap d'image au survol, l'affichage des badges et le lazy-loading.
 *        Lien vers la fiche produit avec l'animation de transition.
 * @dépendances react, next/image, next/link, framer-motion, types/index
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant ProductCard.
 */
interface ProductCardProps {
  /** Données du produit à afficher */
  product: Product
  /** Classe CSS additionnelle sur le conteneur */
  className?: string
  /** Index dans la grille (pour les animations staggerées) */
  index?: number
}

/* ============================================================
 * COMPOSANT BADGE
 * Affiche le badge de statut produit (New In, Exclusive, Sale)
 * ============================================================ */

/**
 * ProductBadge — badge de statut produit.
 *
 * @param status - Statut du produit déterminant la couleur et le texte
 */
const ProductBadge: React.FC<{ status: Product['status'] }> = ({ status }) => {
  /* Pas de badge pour les produits standard ou épuisés */
  if (status === 'standard' || status === 'sold_out') return null

  /** Mapping statut → classes Tailwind et libellé */
  const badgeConfig: Record<
    Exclude<Product['status'], 'standard' | 'sold_out'>,
    { classes: string; label: string }
  > = {
    /* Badge noir pour les nouveautés */
    new: { classes: 'bg-end-black text-end-white', label: 'New In' },
    /* Badge gris foncé pour les exclusivités END. */
    exclusive: { classes: 'bg-end-gray-dark text-end-white', label: 'Exclusive' },
    /* Badge rouge pour les articles soldés */
    sale: { classes: 'bg-end-red text-end-white', label: 'Sale' },
  }

  const config = badgeConfig[status]

  return (
    <span
      className={`inline-block px-2 py-0.5 text-2xs font-bold uppercase tracking-wider ${config.classes}`}
    >
      {config.label}
    </span>
  )
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * ProductCard — carte produit de la grille END. Clothing.
 *
 * Comportements :
 * - Swap d'image au survol : affiche l'hoverImage à la place du mainImage
 * - Badge de statut en superposition sur l'image
 * - Prix barré affiché si le produit est en solde
 * - Lazy loading des images via Next.js Image
 * - Lien vers /product/[slug] pour la navigation vers la fiche produit
 *
 * @param product   - Données du produit à afficher
 * @param className - Classes CSS additionnelles
 * @param index     - Position dans la grille (pour les animations)
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  index = 0,
}) => {
  /* État de survol pour le swap d'image */
  const [isHovered, setIsHovered] = useState<boolean>(false)

  /**
   * Formate un prix en euros avec le format régional français.
   *
   * @param price - Prix en euros (nombre entier ou décimal)
   * @returns Chaîne formatée (ex. "130,00 €")
   */
  const formatPrice = (price: number): string =>
    price.toLocaleString('fr-FR') + ' XOF'

  /** Calcule la réduction en pourcentage pour les articles soldés */
  const discountPercent =
    product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null

  return (
    /* Lien englobant toute la carte — navigation vers la fiche produit */
    <Link
      href={`/product/${product.slug}`}
      className={`group block bg-end-white ${className}`}
      /* Activation du swap d'image au survol de la carte entière */
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* === ZONE IMAGE ===
          Ratio carré (1:1) pour les sneakers, légèrement plus haut pour les vêtements */}
      <div className="relative aspect-square overflow-hidden bg-end-gray-light">

        {/* --- Image principale --- */}
        <Image
          src={product.mainImage.src}
          alt={product.mainImage.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-opacity duration-300 ${
            /* Fondu vers l'image de survol */
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          /* Lazy loading activé par défaut sur Next.js Image */
          loading={index < 4 ? 'eager' : 'lazy'}
        />

        {/* --- Image de survol (swap) ---
            Chargée en arrière-plan dès le montage pour éviter le flash */}
        <Image
          src={product.hoverImage.src}
          alt={product.hoverImage.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-opacity duration-300 absolute inset-0 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          /* Priorité basse : image secondaire chargée après le contenu critique */
          aria-hidden="true"
        />

        {/* --- Badge de statut en superposition ---
            Positionné en haut à gauche, visible en permanence */}
        <div className="absolute top-2 left-2 z-10">
          <ProductBadge status={product.status} />
        </div>

        {/* --- Indication "Épuisé" ---
            Overlay gris semi-transparent sur les articles sold_out */}
        {product.status === 'sold_out' && (
          <div className="absolute inset-0 bg-end-white/60 flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-end-gray-dark">
              Épuisé
            </span>
          </div>
        )}
      </div>

      {/* === ZONE INFORMATIONS PRODUIT ===
          Padding asymétrique : plus de padding en bas qu'en haut */}
      <div className="pt-3 pb-4 px-0">

        {/* Nom de la marque — texte court, noir, caractères légèrement espacés */}
        <p className="text-xs font-bold uppercase tracking-wider text-end-black mb-0.5">
          {product.brand}
        </p>

        {/* Nom du produit — texte gris, une ligne, ellipsis si trop long */}
        <p className="text-xs text-end-gray-dark truncate mb-2">
          {product.name}
        </p>

        {/* === ZONE PRIX ===
            Affichage différent selon le statut (soldé ou normal) */}
        <div className="flex items-center gap-2">

          {/* Prix actuel — rouge si en solde, noir sinon */}
          <span
            className={`text-sm font-semibold ${
              product.status === 'sale' ? 'text-end-red' : 'text-end-black'
            }`}
          >
            {formatPrice(product.price)}
          </span>

          {/* Prix original barré — visible uniquement pour les articles soldés */}
          {product.originalPrice && (
            <span className="text-xs text-end-gray-mid line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}

          {/* Pourcentage de réduction affiché entre parenthèses */}
          {discountPercent && (
            <span className="text-xs text-end-red font-medium">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
