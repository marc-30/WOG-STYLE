/**
 * @fichier components/layout/MiniCart.tsx
 * @rôle Drawer mini-panier latéral s'ouvrant depuis la droite.
 *        Affiche les articles du panier avec quantités, prix et actions de suppression.
 *        Animé par Framer Motion avec un slide-in depuis la droite.
 * @dépendances react, next/image, next/link, framer-motion, hooks/useCart
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import type { CartItem } from '@/types'

/* ============================================================
 * VARIANTES D'ANIMATION
 * ============================================================ */

/** Animation du backdrop (overlay semi-transparent) */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

/** Animation du drawer (slide depuis la droite) */
const drawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ============================================================
 * SOUS-COMPOSANT : LIGNE D'ARTICLE
 * ============================================================ */

/**
 * CartItemRow — ligne d'article individuel dans le mini-panier.
 *
 * @param item       - Données de l'article du panier
 * @param onRemove   - Callback pour supprimer l'article
 * @param onQuantity - Callback pour mettre à jour la quantité
 */
const CartItemRow: React.FC<{
  item: CartItem
  onRemove: (id: string) => void
  onQuantity: (id: string, qty: number) => void
}> = ({ item, onRemove, onQuantity }) => {
  /** Formate le prix unitaire capturé à l'ajout */
  const formattedPrice = item.priceAtAdd.toLocaleString('fr-FR') + ' XOF'

  /** Formate le total de la ligne (prix × quantité) */
  const formattedTotal = (item.priceAtAdd * item.quantity).toLocaleString('fr-FR') + ' XOF'

  return (
    <div className="flex gap-3 py-4 border-b border-end-gray-border last:border-b-0">

      {/* Image miniature du produit */}
      <div className="relative w-20 h-24 flex-shrink-0 bg-end-gray-light">
        <Image
          src={item.product.mainImage.src}
          alt={item.product.mainImage.alt}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Informations de l'article */}
      <div className="flex-1 min-w-0">

        {/* Nom de la marque */}
        <p className="text-xs font-bold uppercase tracking-wider text-end-black mb-0.5">
          {item.product.brand}
        </p>

        {/* Nom du produit */}
        <p className="text-xs text-end-gray-dark truncate mb-1">
          {item.product.name}
        </p>

        {/* Taille sélectionnée */}
        <p className="text-xs text-end-gray-mid mb-3">
          Taille : {item.selectedSize.label}
        </p>

        {/* Contrôles de quantité et prix */}
        <div className="flex items-center justify-between">

          {/* Sélecteur de quantité + / - */}
          <div className="flex items-center border border-end-gray-border">
            <button
              type="button"
              onClick={() => onQuantity(item.cartItemId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-sm hover:bg-end-gray-light transition-colors"
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-semibold border-x border-end-gray-border">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(item.cartItemId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-sm hover:bg-end-gray-light transition-colors"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>

          {/* Prix total de la ligne */}
          <span className="text-sm font-semibold text-end-black">
            {formattedTotal}
          </span>
        </div>
      </div>

      {/* Bouton de suppression */}
      <button
        type="button"
        onClick={() => onRemove(item.cartItemId)}
        aria-label={`Supprimer ${item.product.name} du panier`}
        className="flex-shrink-0 text-end-gray-mid hover:text-end-black transition-colors self-start"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 1L13 13M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * MiniCart — drawer panier latéral de l'application END. Clothing.
 *
 * Affiché en superposition sur le contenu, depuis la droite.
 * Fermeture par clic sur l'overlay ou le bouton de fermeture.
 * Affiche la liste des articles, le total et les CTA de checkout.
 */
export const MiniCart: React.FC = () => {
  const {
    items,
    isOpen,
    totalPrice,
    formattedTotalPrice,
    isEmpty,
    removeItem,
    updateQuantity,
    closeCart,
  } = useCart()

  const { isAuthenticated, loaded } = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        /* Fragment pour afficher backdrop + drawer en parallèle */
        <>
          {/* === OVERLAY SEMI-TRANSPARENT ===
              Clic = fermeture du drawer */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/40 z-70"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* === DRAWER PRINCIPAL ===
              Positionné à droite, hauteur plein écran */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-end-white z-70 flex flex-col shadow-end-drawer"
            role="dialog"
            aria-label="Votre panier"
            aria-modal="true"
          >

            {/* === EN-TÊTE DU DRAWER ===
                Titre et bouton de fermeture */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-end-gray-border flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-end-black">
                  Votre panier
                </h2>
                {/* Sous-titre avec nombre d'articles */}
                {!isEmpty && (
                  <p className="text-xs text-end-gray-mid mt-0.5">
                    {items.reduce((t, i) => t + i.quantity, 0)}{' '}
                    {items.reduce((t, i) => t + i.quantity, 0) === 1
                      ? 'article'
                      : 'articles'}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Fermer le panier"
                className="text-end-black hover:opacity-60 transition-opacity"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 2L14 14M14 2L2 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* === CONTENU SCROLLABLE DU DRAWER === */}
            <div className="flex-1 overflow-y-auto px-4 drawer-scroll">

              {/* ── Vérification de session (attend hydratation) ── */}
              {loaded && !isAuthenticated ? (

                /* === NON CONNECTÉ : invite à se connecter === */
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-6 text-end-gray-border">
                    <circle cx="24" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 44c0-9.9 8.06-18 18-18s18 8.1 18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm font-bold uppercase tracking-widest text-end-black mb-2">
                    Connectez-vous pour voir votre panier
                  </p>
                  <p className="text-xs text-end-gray-mid mb-8 max-w-xs leading-relaxed">
                    Accédez à votre panier, retrouvez vos commandes et profitez d'une expérience personnalisée.
                  </p>
                  <Link
                    href="/connexion"
                    onClick={closeCart}
                    className="w-full max-w-xs bg-end-black text-end-white py-3 text-xs font-bold uppercase tracking-widest text-center hover:opacity-80 transition-opacity block mb-3"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/connexion"
                    onClick={closeCart}
                    className="w-full max-w-xs border border-end-gray-border text-end-black py-3 text-xs font-bold uppercase tracking-widest text-center hover:border-end-black transition-colors block"
                  >
                    Créer un compte
                  </Link>
                </div>

              ) : isEmpty ? (

                /* === CONNECTÉ MAIS PANIER VIDE === */
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-6 text-end-gray-border">
                    <path d="M12 18h24l-3 18H15L12 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M18 18v-4.5C18 10.4 20.7 8 24 8s6 2.4 6 5.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm font-semibold uppercase tracking-widest mb-2">
                    Votre panier est vide
                  </p>
                  <p className="text-sm text-end-gray-mid mb-6">
                    Découvrez nos nouveautés et ajoutez des articles.
                  </p>
                  <Button variant="primary" onClick={closeCart}>
                    Continuer mes achats
                  </Button>
                </div>

              ) : (

                /* === CONNECTÉ + ARTICLES DANS LE PANIER === */
                <div>
                  {items.map((item) => (
                    <CartItemRow
                      key={item.cartItemId}
                      item={item}
                      onRemove={removeItem}
                      onQuantity={updateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* === PIED DU DRAWER : TOTAL ET CTA ===
                Visible uniquement si connecté et panier non vide */}
            {isAuthenticated && !isEmpty && (
              <div className="flex-shrink-0 border-t border-end-gray-border px-4 py-4">

                {/* Frais de livraison */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-end-gray-mid">Livraison</span>
                  <span className="text-xs text-end-gray-mid">
                    {totalPrice >= 50000 ? 'Gratuite' : 'Calculée au checkout'}
                  </span>
                </div>

                {/* Total du panier */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-sm font-bold">{formattedTotalPrice}</span>
                </div>

                {/* Bouton de validation — CTA principal */}
                <Link
                  href="/paiement"
                  onClick={closeCart}
                  className="block w-full bg-end-black text-end-white py-4 text-xs font-bold uppercase tracking-widest text-center hover:opacity-80 transition-opacity"
                >
                  Passer la commande
                </Link>

                {/* Lien vers le panier complet */}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block text-center text-xs underline underline-offset-2 text-end-gray-dark hover:text-end-black mt-3 transition-colors"
                >
                  Voir le panier complet
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MiniCart
