/**
 * @fichier components/ui/Button.tsx
 * @rôle Composant bouton réutilisable et accessible, conforme à la charte END. Clothing.
 *        Supporte plusieurs variantes visuelles (primary, secondary, ghost, danger),
 *        plusieurs tailles, et les états de chargement et désactivation.
 * @dépendances react
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React from 'react'

/* ============================================================
 * TYPES ET INTERFACES
 * ============================================================ */

/**
 * Variantes visuelles disponibles pour le bouton.
 * - primary  : fond noir, texte blanc — CTA principal (Add to Bag)
 * - secondary: fond blanc, bordure noire — CTA secondaire
 * - ghost    : transparent, sans bordure — liens et actions tertiaires
 * - danger   : fond rouge — actions destructrices
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/**
 * Tailles disponibles pour le bouton.
 * - sm : petit bouton pour les actions compactes
 * - md : taille standard pour la majorité des usages
 * - lg : grand bouton pour les CTA proéminents (Add to Bag)
 */
type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Props du composant Button.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visuelle du bouton */
  variant?: ButtonVariant
  /** Taille du bouton */
  size?: ButtonSize
  /** Indique si le bouton est en état de chargement */
  loading?: boolean
  /** Indique si le bouton occupe toute la largeur disponible */
  fullWidth?: boolean
  /** Icône SVG affiché à gauche du texte */
  leftIcon?: React.ReactNode
  /** Icône SVG affiché à droite du texte */
  rightIcon?: React.ReactNode
  /** Contenu du bouton */
  children: React.ReactNode
}

/* ============================================================
 * CLASSES TAILWIND PAR VARIANTE ET TAILLE
 * Centralisées ici pour maintenir la cohérence et faciliter les modifications
 * ============================================================ */

/** Classes de base communes à toutes les variantes */
const BASE_CLASSES =
  'inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

/** Classes par variante visuelle */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  /* Fond noir avec texte blanc — action principale */
  primary:
    'bg-end-black text-end-white hover:bg-end-hover focus-visible:outline-end-black',
  /* Fond blanc avec bordure noire — action secondaire */
  secondary:
    'bg-end-white text-end-black border border-end-black hover:bg-end-black hover:text-end-white focus-visible:outline-end-black',
  /* Transparent sans décoration — action tertiaire */
  ghost:
    'bg-transparent text-end-black hover:bg-end-gray-light focus-visible:outline-end-black',
  /* Rouge pour les actions destructrices */
  danger:
    'bg-end-red text-end-white hover:bg-red-700 focus-visible:outline-end-red',
}

/** Classes par taille */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  /* Petit : icônes et actions compactes */
  sm: 'px-3 py-1.5 text-xs',
  /* Standard : majorité des boutons */
  md: 'px-5 py-2.5 text-sm',
  /* Grand : CTA proéminents comme "Add to Bag" */
  lg: 'px-8 py-4 text-sm',
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * Composant Button — bouton universel de l'interface END. Clothing.
 *
 * @param variant    - Variante visuelle (défaut: 'primary')
 * @param size       - Taille du bouton (défaut: 'md')
 * @param loading    - État de chargement avec spinner (défaut: false)
 * @param fullWidth  - Largeur totale du conteneur parent (défaut: false)
 * @param leftIcon   - Élément React affiché avant le texte
 * @param rightIcon  - Élément React affiché après le texte
 * @param children   - Contenu textuel du bouton
 * @param ...props   - Props HTML natifs du bouton (onClick, disabled, type, etc.)
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  /* Construction de la classe CSS finale par concaténation des classes conditionnelles */
  const buttonClasses = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    /* Largeur totale si demandée */
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={buttonClasses}
      /* Désactivation pendant le chargement pour éviter les doubles soumissions */
      disabled={disabled || loading}
      {...props}
    >
      {/* === SPINNER DE CHARGEMENT ===
          SVG animé visible uniquement lorsque loading=true */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {/* === ICÔNE GAUCHE ===
          Affiché uniquement si fourni et non en chargement */}
      {!loading && leftIcon && (
        <span className="mr-2 flex items-center" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      {/* === CONTENU TEXTUEL === */}
      <span>{children}</span>

      {/* === ICÔNE DROITE === */}
      {!loading && rightIcon && (
        <span className="ml-2 flex items-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
}

export default Button
