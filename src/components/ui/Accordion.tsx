/**
 * @fichier components/ui/Accordion.tsx
 * @rôle Composant accordéon accessible et animé, utilisé dans les filtres produit,
 *        la fiche produit (description, guide des tailles) et le footer.
 *        Construit sur Headless UI pour l'accessibilité (ARIA, clavier),
 *        animé avec Framer Motion pour une transition fluide de hauteur.
 * @dépendances react, @headlessui/react, framer-motion
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props d'un item individuel d'accordéon.
 */
interface AccordionItemProps {
  /** Titre affiché dans le header cliquable */
  title: string
  /** Contenu déployé lors de l'ouverture */
  children: React.ReactNode
  /** Indique si l'item est ouvert par défaut */
  defaultOpen?: boolean
  /** Classe CSS additionnelle sur le conteneur */
  className?: string
}

/**
 * Props du composant Accordion (multi-items).
 */
interface AccordionProps {
  /** Liste des items de l'accordéon */
  items: {
    id: string
    title: string
    content: React.ReactNode
    defaultOpen?: boolean
  }[]
  /** Mode "one open at a time" : ferme les autres à l'ouverture d'un item */
  exclusive?: boolean
  /** Classe CSS additionnelle sur le conteneur */
  className?: string
}

/* ============================================================
 * VARIANTES D'ANIMATION FRAMER MOTION
 * Transition de hauteur fluide pour le contenu de l'accordéon
 * ============================================================ */

/** Animation d'ouverture/fermeture du contenu */
const contentVariants = {
  /* État fermé : hauteur nulle et opacité 0 */
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.15 },
    },
  },
  /* État ouvert : hauteur automatique et pleine opacité */
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
}

/** Animation de rotation de l'icône chevron */
const chevronVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180, transition: { duration: 0.25 } },
}

/* ============================================================
 * COMPOSANT ACCORDÉON SIMPLE (UN SEUL ITEM)
 * ============================================================ */

/**
 * AccordionItem — item accordéon autonome avec gestion de son propre état.
 * Utilisé directement dans les fiches produit pour les sections description, etc.
 *
 * @param title       - Libellé du header cliquable
 * @param children    - Contenu affiché lors de l'expansion
 * @param defaultOpen - Ouvert par défaut si true
 * @param className   - Classes CSS additionnelles
 */
export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
}) => {
  /* État local d'ouverture/fermeture */
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen)

  return (
    /* Conteneur de l'item avec séparateur en bas */
    <div className={`border-b border-end-gray-border ${className}`}>

      {/* === HEADER CLIQUABLE ===
          Bouton accessible avec attributs ARIA pour les lecteurs d'écran */}
      <button
        className="w-full flex items-center justify-between py-4 text-left group"
        onClick={() => setIsOpen((prev) => !prev)}
        /* Attributs ARIA d'accessibilité pour les accordéons */
        aria-expanded={isOpen}
        type="button"
      >
        {/* Titre de l'accordéon */}
        <span className="text-sm font-semibold uppercase tracking-wider text-end-black group-hover:opacity-70 transition-opacity">
          {title}
        </span>

        {/* Icône chevron animée par Framer Motion */}
        <motion.span
          variants={chevronVariants}
          animate={isOpen ? 'open' : 'closed'}
          className="flex-shrink-0 ml-4"
          aria-hidden="true"
        >
          {/* SVG chevron vers le bas */}
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L6 6L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      {/* === CONTENU ANIMÉ ===
          AnimatePresence gère l'entrée et sortie du DOM avec animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            variants={contentVariants}
            initial="closed"
            animate="open"
            exit="closed"
            /* overflow hidden nécessaire pour que la hauteur soit contrainte */
            style={{ overflow: 'hidden' }}
          >
            {/* Padding interne du contenu */}
            <div className="pb-4 text-sm text-end-gray-dark leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================
 * COMPOSANT ACCORDÉON MULTI-ITEMS
 * ============================================================ */

/**
 * Accordion — groupe d'items accordéon avec gestion optionnelle du mode exclusif.
 *
 * @param items     - Tableau des items avec id, titre, contenu
 * @param exclusive - Si true, un seul item peut être ouvert à la fois
 * @param className - Classes CSS additionnelles
 */
export const Accordion: React.FC<AccordionProps> = ({
  items,
  exclusive = false,
  className = '',
}) => {
  /* État des items ouverts : Set des IDs des items actuellement ouverts */
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(
      /* Initialisation avec les items defaultOpen=true */
      items.filter((item) => item.defaultOpen).map((item) => item.id)
    )
  )

  /**
   * Bascule l'état ouvert/fermé d'un item accordéon.
   * En mode exclusif, ferme tous les autres items avant d'ouvrir le nouveau.
   *
   * @param itemId - Identifiant de l'item à basculer
   */
  const toggleItem = (itemId: string): void => {
    setOpenItems((prev) => {
      const newOpenItems = new Set(prev)

      if (newOpenItems.has(itemId)) {
        /* Fermeture de l'item actuellement ouvert */
        newOpenItems.delete(itemId)
      } else {
        /* En mode exclusif : fermeture de tous les autres items */
        if (exclusive) {
          newOpenItems.clear()
        }
        /* Ouverture du nouvel item */
        newOpenItems.add(itemId)
      }

      return newOpenItems
    })
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id)

        return (
          <div key={item.id} className="border-b border-end-gray-border">

            {/* Header cliquable de l'item */}
            <button
              className="w-full flex items-center justify-between py-4 text-left group"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              type="button"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-end-black group-hover:opacity-70 transition-opacity">
                {item.title}
              </span>

              {/* Chevron animé */}
              <motion.span
                variants={chevronVariants}
                animate={isOpen ? 'open' : 'closed'}
                className="flex-shrink-0 ml-4"
                aria-hidden="true"
              >
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L6 6L11 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
            </button>

            {/* Contenu animé de l'item */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`content-${item.id}`}
                  variants={contentVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pb-4 text-sm text-end-gray-dark leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default AccordionItem
