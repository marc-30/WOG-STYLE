/**
 * @fichier store/cartStore.ts
 * @rôle Store Zustand pour la gestion globale du panier d'achat.
 *        Gère l'état du panier (articles, totaux) et l'état UI du drawer mini-panier.
 *        Toutes les mutations du panier passent exclusivement par ce store.
 * @dépendances zustand, types/index
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type { CartState, CartActions, CartItem, Product, ProductSize } from '@/types'

/**
 * Le panier est lié à la session utilisateur : il ne doit persister en localStorage
 * que si un compte est connecté (marqueur `wog_auth`, posé par useAuth au login/logout).
 * Un visiteur non connecté repart donc du panier vide à chaque ouverture du site.
 */
const AUTH_KEY = 'wog_auth'

const sessionScopedStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined' || !window.localStorage.getItem(AUTH_KEY)) return null
    return window.localStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined' || !window.localStorage.getItem(AUTH_KEY)) return
    window.localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(name)
  },
}

/* ============================================================
 * TYPE COMPLET DU STORE
 * Fusion de l'état et des actions pour la définition du store Zustand
 * ============================================================ */
type CartStore = CartState & CartActions

/* ============================================================
 * FONCTIONS UTILITAIRES PURES
 * Ces fonctions calculent les totaux à partir du tableau d'articles.
 * Elles sont séparées pour être testables indépendamment.
 * ============================================================ */

/**
 * Calcule le nombre total d'articles dans le panier.
 * Additionne les quantités de chaque ligne de panier.
 *
 * @param items - Tableau des articles du panier
 * @returns Nombre total d'articles (somme des quantités)
 */
const computeTotalItems = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0)

/**
 * Calcule le montant total du panier en euros.
 * Multiplie le prix capturé à l'ajout par la quantité de chaque article.
 *
 * @param items - Tableau des articles du panier
 * @returns Montant total en euros (nombre décimal)
 */
const computeTotalPrice = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.priceAtAdd * item.quantity, 0)

/**
 * Génère un identifiant unique pour un article du panier.
 * L'identifiant combine l'ID produit et la taille sélectionnée,
 * permettant d'avoir le même produit en plusieurs tailles.
 *
 * @param productId - Identifiant unique du produit
 * @param sizeValue - Valeur de la taille sélectionnée (ex. "42")
 * @returns Identifiant composite de l'article panier
 */
const generateCartItemId = (productId: string, sizeValue: string): string =>
  `${productId}-${sizeValue}`

/* ============================================================
 * CRÉATION DU STORE ZUSTAND
 * Utilisation du middleware `persist` pour sauvegarder le panier
 * dans le localStorage du navigateur entre les sessions.
 * ============================================================ */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      /* --- ÉTAT INITIAL --- */

      /** Tableau vide d'articles au chargement */
      items: [],

      /** Le drawer mini-panier est fermé par défaut */
      isOpen: false,

      /** Pas d'articles au départ */
      totalItems: 0,

      /** Montant total à zéro */
      totalPrice: 0,

      /* --- ACTIONS --- */

      /**
       * Ajoute un produit au panier avec la taille sélectionnée.
       * Si le même produit dans la même taille existe déjà,
       * incrémente la quantité au lieu de dupliquer la ligne.
       *
       * @param product - Le produit à ajouter
       * @param size    - La taille sélectionnée par l'utilisateur
       */
      addItem: (product: Product, size: ProductSize) => {
        /* Génération de l'identifiant composite produit + taille */
        const cartItemId = generateCartItemId(product.id, size.value)
        const currentItems = get().items

        /* Recherche d'un article existant avec le même ID composite */
        const existingItem = currentItems.find(
          (item) => item.cartItemId === cartItemId
        )

        let updatedItems: CartItem[]

        if (existingItem) {
          /* Article déjà présent : incrémentation de la quantité */
          updatedItems = currentItems.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          /* Nouvel article : création de la ligne panier */
          const newItem: CartItem = {
            cartItemId,
            product,
            selectedSize: size,
            quantity: 1,
            /* Capture du prix au moment de l'ajout pour éviter les variations */
            priceAtAdd: product.price,
          }
          updatedItems = [...currentItems, newItem]
        }

        /* Mise à jour de l'état avec les nouveaux totaux calculés */
        set({
          items: updatedItems,
          totalItems: computeTotalItems(updatedItems),
          totalPrice: computeTotalPrice(updatedItems),
          /* Ouverture automatique du drawer lors de l'ajout */
          isOpen: true,
        })
      },

      /**
       * Supprime un article du panier par son identifiant composite.
       * Recalcule les totaux après suppression.
       *
       * @param cartItemId - Identifiant de l'article à supprimer
       */
      removeItem: (cartItemId: string) => {
        const updatedItems = get().items.filter(
          (item) => item.cartItemId !== cartItemId
        )

        set({
          items: updatedItems,
          totalItems: computeTotalItems(updatedItems),
          totalPrice: computeTotalPrice(updatedItems),
        })
      },

      /**
       * Met à jour la quantité d'un article existant dans le panier.
       * Si la quantité demandée est 0 ou négative, supprime l'article.
       *
       * @param cartItemId - Identifiant de l'article à modifier
       * @param quantity   - Nouvelle quantité souhaitée
       */
      updateQuantity: (cartItemId: string, quantity: number) => {
        /* Suppression si quantité nulle ou négative */
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }

        const updatedItems = get().items.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        )

        set({
          items: updatedItems,
          totalItems: computeTotalItems(updatedItems),
          totalPrice: computeTotalPrice(updatedItems),
        })
      },

      /**
       * Vide entièrement le panier.
       * Remet tous les totaux à zéro.
       */
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        })
      },

      /**
       * Ouvre le drawer mini-panier.
       * Déclenche l'animation slide-in depuis la droite.
       */
      openCart: () => set({ isOpen: true }),

      /**
       * Ferme le drawer mini-panier.
       * Déclenche l'animation slide-out vers la droite.
       */
      closeCart: () => set({ isOpen: false }),

      /**
       * Bascule l'état ouvert/fermé du drawer mini-panier.
       * Utilisé par l'icône panier dans le header.
       */
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),

    /* --- CONFIGURATION DU MIDDLEWARE PERSIST ---
     * Sauvegarde l'état du panier dans localStorage pour persistance entre sessions.
     * Seul l'état (items, totaux) est persisté, pas les handlers de l'UI (isOpen).
     */
    {
      name: 'end-clothing-cart',
      storage: createJSONStorage(() => sessionScopedStorage),
      /* Sélection des champs à persister (exclusion de isOpen) */
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
)
