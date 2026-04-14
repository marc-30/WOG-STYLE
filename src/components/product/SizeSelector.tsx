/**
 * @fichier components/product/SizeSelector.tsx
 * @rôle Sélecteur de taille pour la fiche produit.
 *        Affiche les tailles en grille, indique les tailles épuisées (strikethrough + grisé),
 *        et gère la sélection active avec feedback visuel.
 * @dépendances react, types/index
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React from 'react'
import type { ProductSize } from '@/types'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant SizeSelector.
 */
interface SizeSelectorProps {
  /** Liste des tailles disponibles pour ce produit */
  sizes: ProductSize[]
  /** Taille actuellement sélectionnée (null si aucune) */
  selectedSize: ProductSize | null
  /** Callback déclenché lors de la sélection d'une taille */
  onSelectSize: (size: ProductSize) => void
  /** Indique si le sélecteur doit afficher une erreur (pas de taille sélectionnée) */
  hasError?: boolean
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * SizeSelector — grille de sélection de taille pour la fiche produit.
 *
 * Comportements :
 * - Taille disponible : bordure fine, fond blanc, hover avec fond gris clair
 * - Taille sélectionnée : fond noir, texte blanc, pas de hover
 * - Taille épuisée : texte gris barré, curseur interdit, non cliquable
 * - État d'erreur : bordure rouge et message d'aide
 *
 * @param sizes        - Tailles disponibles pour ce produit
 * @param selectedSize - Taille sélectionnée (ou null)
 * @param onSelectSize - Callback de sélection
 * @param hasError     - Affiche l'état d'erreur si aucune taille n'est sélectionnée
 */
export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize,
  hasError = false,
}) => {
  return (
    <div>

      {/* === EN-TÊTE ===
          Label "Taille" avec la taille sélectionnée en inline et lien guide */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-end-black">
            Taille
          </span>
          {/* Affichage inline de la taille sélectionnée */}
          {selectedSize && (
            <span className="text-xs text-end-gray-dark">
              : {selectedSize.label}
            </span>
          )}
        </div>

        {/* Lien vers le guide des tailles */}
        <button
          type="button"
          className="text-xs text-end-gray-mid underline underline-offset-2 hover:text-end-black transition-colors"
        >
          Guide des tailles
        </button>
      </div>

      {/* === GRILLE DE TAILLES ===
          Disposition en grille adaptative : 3 colonnes minimum */}
      <div
        className={`grid grid-cols-3 sm:grid-cols-4 gap-1.5 ${
          /* Bordure rouge autour de la grille en cas d'erreur */
          hasError ? 'p-2 border border-end-red' : ''
        }`}
      >
        {sizes.map((size) => {
          /* Détermination de l'état de la cellule pour les classes CSS */
          const isSelected = selectedSize?.value === size.value
          const isOutOfStock = !size.inStock

          return (
            <button
              key={size.value}
              type="button"
              /* Désactivation pour les tailles épuisées */
              disabled={isOutOfStock}
              onClick={() => !isOutOfStock && onSelectSize(size)}
              aria-pressed={isSelected}
              aria-label={`Taille ${size.label}${isOutOfStock ? ' - Épuisée' : ''}`}
              className={`
                relative py-2.5 px-1 text-xs font-medium text-center border transition-all duration-100
                ${isOutOfStock
                  /* Taille épuisée : grisé avec ligne diagonale */
                  ? 'border-end-gray-border text-end-gray-border cursor-not-allowed line-through'
                  : isSelected
                    /* Taille sélectionnée : fond noir, texte blanc */
                    ? 'bg-end-black border-end-black text-end-white'
                    /* Taille disponible : fond blanc, hover gris clair */
                    : 'border-end-gray-border text-end-black hover:border-end-black bg-end-white'
                }
              `}
            >
              {size.label}

              {/* Indicateur épuisé : ligne diagonale en SVG superposée */}
              {isOutOfStock && (
                <span
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1="100"
                      x2="100"
                      y2="0"
                      stroke="#E0E0E0"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* === MESSAGE D'ERREUR ===
          Affiché si l'utilisateur tente d'ajouter sans sélectionner de taille */}
      {hasError && (
        <p className="mt-2 text-xs text-end-red" role="alert">
          Veuillez sélectionner une taille avant d'ajouter au panier.
        </p>
      )}

      {/* === INDICATION STOCK LIMITÉ ===
          Affiché quand moins de 3 tailles sont disponibles */}
      {sizes.filter((s) => s.inStock).length <= 2 &&
        sizes.filter((s) => s.inStock).length > 0 && (
          <p className="mt-2 text-xs text-end-gray-mid">
            Stock limité — seulement{' '}
            <strong>{sizes.filter((s) => s.inStock).length}</strong>{' '}
            {sizes.filter((s) => s.inStock).length === 1 ? 'taille disponible' : 'tailles disponibles'}
          </p>
        )}
    </div>
  )
}

export default SizeSelector
