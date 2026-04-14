/**
 * @fichier hooks/useCart.ts
 * @rôle Hook personnalisé encapsulant l'accès au store panier Zustand.
 *        Expose les données et actions du panier avec une API simplifiée
 *        et fournit des sélecteurs mémoïsés pour éviter les re-rendus inutiles.
 * @dépendances zustand, store/cartStore, types/index
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import { useCartStore } from '@/store/cartStore'
import type { Product, ProductSize, CartItem } from '@/types'

/* ============================================================
 * HOOK PRINCIPAL DU PANIER
 * ============================================================ */

/**
 * Hook useCart — interface principale pour interagir avec le panier.
 *
 * Expose l'état du panier et toutes les actions disponibles,
 * ainsi que des sélecteurs calculés utiles dans les composants.
 *
 * @returns Objet contenant l'état, les actions et les sélecteurs du panier
 *
 * @example
 * const { items, totalPrice, addItem, removeItem } = useCart()
 */
export function useCart() {
  /* Récupération des données d'état depuis le store Zustand */
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const totalItems = useCartStore((state) => state.totalItems)
  const totalPrice = useCartStore((state) => state.totalPrice)

  /* Récupération des actions depuis le store Zustand */
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const toggleCart = useCartStore((state) => state.toggleCart)

  /* ============================================================
   * SÉLECTEURS CALCULÉS
   * Ces valeurs sont dérivées de l'état du panier et évitent
   * de dupliquer la logique de calcul dans les composants.
   * ============================================================ */

  /**
   * Formate le prix total du panier en chaîne lisible avec symbole euro.
   * Utilise toLocaleString pour le formatage régional français.
   *
   * @returns Prix total formaté (ex. "245,00 €")
   */
  const formattedTotalPrice = totalPrice.toLocaleString('fr-FR') + ' XOF'

  /**
   * Indique si le panier contient au moins un article.
   * Utilisé pour afficher/masquer les éléments conditionnels.
   */
  const isEmpty = items.length === 0

  /**
   * Vérifie si un produit spécifique dans une taille donnée est dans le panier.
   * Utile pour changer l'état du bouton "Add to Bag" en "In Your Bag".
   *
   * @param productId - Identifiant du produit à vérifier
   * @param sizeValue - Valeur de la taille à vérifier
   * @returns true si le produit est déjà dans le panier avec cette taille
   */
  const isItemInCart = (productId: string, sizeValue: string): boolean => {
    return items.some(
      (item) =>
        item.product.id === productId && item.selectedSize.value === sizeValue
    )
  }

  /**
   * Récupère la quantité d'un produit spécifique dans une taille donnée.
   *
   * @param productId - Identifiant du produit
   * @param sizeValue - Valeur de la taille
   * @returns Quantité en stock dans le panier (0 si absent)
   */
  const getItemQuantity = (productId: string, sizeValue: string): number => {
    const item = items.find(
      (item) =>
        item.product.id === productId && item.selectedSize.value === sizeValue
    )
    return item?.quantity ?? 0
  }

  /**
   * Wrapper pour l'action addItem qui ouvre automatiquement le drawer.
   * Centralise le comportement d'ajout au panier avec feedback visuel.
   *
   * @param product - Produit à ajouter
   * @param size    - Taille sélectionnée
   */
  const handleAddItem = (product: Product, size: ProductSize): void => {
    addItem(product, size)
    /* L'ouverture du drawer est gérée dans le store lors de addItem */
  }

  return {
    /* --- ÉTAT --- */
    items,
    isOpen,
    totalItems,
    totalPrice,

    /* --- SÉLECTEURS CALCULÉS --- */
    formattedTotalPrice,
    isEmpty,
    isItemInCart,
    getItemQuantity,

    /* --- ACTIONS --- */
    addItem: handleAddItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  }
}
