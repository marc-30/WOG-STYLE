/**
 * @fichier components/product/ProductGallery.tsx
 * @rôle Galerie d'images pour la fiche produit.
 *        Affiche les miniatures à gauche (défilement vertical) et l'image principale
 *        à droite avec effet de zoom au survol. Navigation par clic sur miniature.
 * @dépendances react, next/image, framer-motion
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProductImage } from '@/types'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant ProductGallery.
 */
interface ProductGalleryProps {
  /** Galerie complète des images du produit */
  images: ProductImage[]
  /** Nom du produit (utilisé dans les alt des images) */
  productName: string
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * ProductGallery — galerie d'images de la fiche produit END. Clothing.
 *
 * Layout :
 * - Colonne gauche (8%) : rail de miniatures défilantes en vertical
 * - Colonne principale (92%) : image active avec zoom au survol
 *
 * Comportements :
 * - Clic sur miniature : affiche l'image correspondante
 * - Survol de l'image principale : zoom subtil (scale 1.08)
 * - Transition entre images via Framer Motion (fade)
 *
 * @param images      - Tableau des images de la galerie
 * @param productName - Nom du produit pour les textes alternatifs
 */
export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  /* Index de l'image actuellement affichée en grand */
  const [activeIndex, setActiveIndex] = useState<number>(0)

  /* État de survol pour le zoom de l'image principale */
  const [isZooming, setIsZooming] = useState<boolean>(false)

  /* Position de la souris pour le zoom orienté (future amélioration) */
  const imageRef = useRef<HTMLDivElement>(null)

  /** Image active sélectionnée */
  const activeImage = images[activeIndex]

  return (
    /* Conteneur principal : flexbox horizontal */
    <div className="flex gap-3 h-full">

      {/* === RAIL DE MINIATURES (côté gauche) ===
          Défilement vertical automatique si beaucoup d'images */}
      <div className="hidden md:flex flex-col gap-1.5 overflow-y-auto max-h-[600px] w-16 flex-shrink-0 scrollbar-thin">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Afficher l'image ${index + 1} de ${productName}`}
            aria-pressed={activeIndex === index}
            className={`relative aspect-square w-full flex-shrink-0 border transition-all duration-150 ${
              activeIndex === index
                /* Miniature active : bordure noire */
                ? 'border-end-black'
                /* Miniature inactive : bordure transparente, hover gris */
                : 'border-transparent hover:border-end-gray-mid'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* === IMAGE PRINCIPALE ===
          Occupe tout l'espace restant, avec effet de zoom au survol */}
      <div className="flex-1 relative">
        {/* Conteneur de zoom — overflow hidden pour contraindre le scale */}
        <div
          ref={imageRef}
          className="relative aspect-square overflow-hidden bg-end-gray-light cursor-zoom-in"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
          {/* Animation de transition entre images */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-transform duration-500 ease-out ${
                  /* Zoom subtil au survol */
                  isZooming ? 'scale-110' : 'scale-100'
                }`}
                priority={activeIndex === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* === INDICATEURS DE NAVIGATION MOBILE ===
            Points de navigation visibles uniquement sur mobile */}
        <div className="md:hidden flex items-center justify-center gap-1.5 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Image ${index + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                activeIndex === index ? 'bg-end-black' : 'bg-end-gray-border'
              }`}
            />
          ))}
        </div>

        {/* === NAVIGATION PRÉCÉDENT/SUIVANT (mobile) ===
            Flèches visibles uniquement sur mobile pour le swipe entre images */}
        {images.length > 1 && (
          <div className="md:hidden absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">

            {/* Bouton image précédente */}
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              disabled={activeIndex === 0}
              className="pointer-events-auto w-8 h-8 bg-end-white/80 flex items-center justify-center disabled:opacity-30"
              aria-label="Image précédente"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path
                  d="M7 1L1 7L7 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Bouton image suivante */}
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              disabled={activeIndex === images.length - 1}
              className="pointer-events-auto w-8 h-8 bg-end-white/80 flex items-center justify-center disabled:opacity-30"
              aria-label="Image suivante"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path
                  d="M1 1L7 7L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductGallery
