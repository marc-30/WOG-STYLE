/**
 * @fichier components/layout/MegaMenu.tsx
 * @rôle Mega-menu déroulant de navigation principale END. Clothing.
 *        S'ouvre au survol des éléments du menu principal avec une transition
 *        fluide (fade + décalage vertical). Affiche des colonnes de sous-catégories,
 *        une liste de marques et des blocs images illustratifs.
 * @dépendances react, framer-motion, next/link, next/image
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { NavItem } from '@/types'

/* ============================================================
 * DONNÉES DE NAVIGATION
 * Structure complète du menu avec mega-menus par catégorie
 * ============================================================ */

/** Configuration complète des éléments de navigation principale */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Accueil',
    href: '/',
    hasMegaMenu: false,
  },
  {
    label: 'Ma Boutique',
    href: '/boutique',
    hasMegaMenu: false,
  },
  {
    label: 'À propos',
    href: '/about',
    hasMegaMenu: false,
  },
  {
    label: 'Contact',
    href: '/contact',
    hasMegaMenu: false,
  },
]

/* ============================================================
 * VARIANTES D'ANIMATION DU MEGA-MENU
 * Transition fluide : fade + léger décalage vertical (8px → 0px)
 * ============================================================ */

/** Variants Framer Motion pour le panneau du mega-menu */
const megaMenuVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant MegaMenu.
 */
interface MegaMenuProps {
  /** Élément de navigation dont le mega-menu est affiché */
  activeItem: NavItem | null
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * MegaMenu — panneau déroulant de navigation avancée.
 *
 * Affiché en position absolue sous la barre de navigation principale.
 * Composé de colonnes de liens et de blocs images illustratifs.
 *
 * @param activeItem - Item de nav actif (null = mega-menu fermé)
 */
export const MegaMenu: React.FC<MegaMenuProps> = ({ activeItem }) => {
  /* Pas d'affichage si pas d'item actif ou si l'item n'a pas de mega-menu */
  const isVisible = activeItem !== null && activeItem.hasMegaMenu

  return (
    <AnimatePresence>
      {isVisible && activeItem && (
        <motion.div
          key={activeItem.label}
          variants={megaMenuVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          /* Panneau pleine largeur positionné en absolu sous le header */
          className="absolute top-full left-0 right-0 bg-end-white border-t border-end-gray-border shadow-end-header z-50"
        >
          {/* Conteneur centré avec marges latérales */}
          <div className="max-w-screen-2xl mx-auto px-8 py-8">
            <div className="flex gap-12">

              {/* === COLONNES DE LIENS ===
                  Chaque colonne représente une sous-catégorie */}
              <div className="flex gap-10 flex-1">
                {activeItem.megaMenuColumns?.map((column, colIndex) => (
                  <div key={colIndex} className="min-w-0">

                    {/* Titre de la colonne */}
                    <h3 className="text-xs font-bold uppercase tracking-widest text-end-black mb-4">
                      {column.title}
                    </h3>

                    {/* Liste des liens de la colonne */}
                    <ul className="space-y-2.5">
                      {column.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className={`text-sm transition-colors duration-100 block ${
                              link.highlighted
                                /* Lien mis en avant : noir, gras */
                                ? 'font-semibold text-end-black hover:opacity-70'
                                /* Lien standard : gris avec hover noir */
                                : 'text-end-gray-dark hover:text-end-black'
                            }`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* === BLOCS IMAGES ILLUSTRATIFS ===
                  Affichés à droite des colonnes de liens */}
              {activeItem.megaMenuImages && activeItem.megaMenuImages.length > 0 && (
                <div className="flex gap-4 flex-shrink-0">
                  {activeItem.megaMenuImages.map((imageBlock, imgIndex) => (
                    <Link
                      key={imgIndex}
                      href={imageBlock.href}
                      className="group block w-40"
                    >
                      {/* Conteneur image avec ratio fixe */}
                      <div className="relative w-40 h-52 overflow-hidden mb-2">
                        {/* Utilisation d'une balise img standard pour les URL externes */}
                        <img
                          src={imageBlock.imageSrc}
                          alt={imageBlock.imageAlt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      {/* Titre sous l'image */}
                      <p className="text-xs font-semibold uppercase tracking-wider text-end-black group-hover:opacity-70 transition-opacity">
                        {imageBlock.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MegaMenu
