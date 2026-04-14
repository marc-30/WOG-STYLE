/**
 * @fichier types/index.ts
 * @rôle Définitions TypeScript centralisées pour l'ensemble du projet END. Clothing Clone.
 *        Contient les interfaces des produits, marques, panier, filtres et navigation.
 *        Toutes les données qui transitent dans l'application sont typées ici.
 * @dépendances aucune
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

/* ============================================================
 * TYPES DE BASE
 * ============================================================ */

/**
 * Genre disponible pour le filtrage des produits.
 */
export type Genre = 'men' | 'women' | 'unisex' | 'HOMME' | 'FEMME' | 'UNISEXE'

/**
 * Catégorie principale de produit.
 * Correspond aux entrées du menu principal de navigation.
 */
export type Category =
  | 'sneakers'
  | 'clothing'
  | 'footwear'
  | 'accessories'
  | 'lifestyle'
  | 'active'

/**
 * Statut du produit pour l'affichage des badges.
 * - 'new'       : badge "New In" noir
 * - 'exclusive' : badge "Exclusive" gris foncé
 * - 'sale'      : badge "Sale" rouge avec prix barré
 * - 'sold_out'  : produit épuisé, non commandable
 * - 'standard'  : produit sans badge particulier
 */
export type ProductStatus = 'new' | 'exclusive' | 'sale' | 'sold_out' | 'standard'

/**
 * Options de tri de la grille produit.
 * Correspond aux options du sélecteur en haut de la page liste.
 */
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'relevance'

/* ============================================================
 * INTERFACES PRODUIT
 * ============================================================ */

/**
 * Représente une taille disponible pour un produit.
 * Chaque taille peut être disponible ou épuisée.
 */
export interface ProductSize {
  /** Libellé de la taille affiché : ex. "EU 42", "S", "M", "XL" */
  label: string
  /** Valeur interne utilisée pour les requêtes et le panier */
  value: string
  /** Indique si la taille est encore en stock */
  inStock: boolean
}

/**
 * Représente une image produit.
 * Chaque produit dispose d'une image principale et d'une image alternative au survol.
 */
export interface ProductImage {
  /** URL de l'image */
  src: string
  /** Texte alternatif pour l'accessibilité */
  alt: string
  /** Largeur native de l'image en pixels */
  width: number
  /** Hauteur native de l'image en pixels */
  height: number
}

/**
 * Interface principale représentant un produit END. Clothing.
 * Utilisée dans les cartes, les fiches produit et le panier.
 */
export interface Product {
  images?: string[]
  image?: any
  /** Identifiant unique du produit */
  id: string
  /** Slug URL pour les routes dynamiques Next.js */
  slug: string
  /** Nom de la marque : Nike, adidas, Stone Island, etc. */
  brand: string
  /** Nom complet du produit */
  name: string
  /** Référence fabricant ou SKU interne */
  sku: string
  /** Prix actuel en euros (centimes si besoin) */
  price: number
  /** Prix original avant remise (null si pas en solde) */
  originalPrice: number | null
  /** Devise d'affichage */
  currency: string
  /** Image principale affichée dans la grille */
  mainImage: ProductImage
  /** Image affichée au survol de la carte produit */
  hoverImage: ProductImage
  /** Galerie complète pour la page fiche produit */
  gallery: ProductImage[]
  /** Tailles disponibles avec leur stock */
  sizes: ProductSize[]
  /** Couleur principale du produit */
  color: string
  /** Catégorie de navigation */
  category: Category
  /** Genre cible */
  genre: Genre
  /** Statut pour les badges */
  status: ProductStatus
  /** Description détaillée pour la fiche produit */
  description: string
  /** Matières et composition */
  composition: string
  /** Identifiant de la marque pour les filtres */
  brandId: string
  /** Tags de recherche */
  tags: string[]
  /** Date d'ajout au catalogue (format ISO 8601) */
  addedAt: string
  /** Indique si le produit est mis en avant sur la page d'accueil */
  featured: boolean
  /** Stock total disponible */
  stock?: number
}

/* ============================================================
 * INTERFACES MARQUE
 * ============================================================ */

/**
 * Représente une marque référencée sur END. Clothing.
 * Les marques apparaissent dans le mega-menu, les filtres et la page d'accueil.
 */
export interface Brand {
  /** Identifiant unique de la marque */
  id: string
  /** Slug pour les URLs de filtrage */
  slug: string
  /** Nom commercial affiché */
  name: string
  /** Catégories dans lesquelles la marque est présente */
  categories: Category[]
  /** URL du logo de la marque (SVG ou PNG) */
  logoUrl: string | null
  /** Indique si la marque est mise en avant dans le mega-menu */
  featured: boolean
  /** Description courte pour la page marque */
  description: string
}

/* ============================================================
 * INTERFACES PANIER
 * ============================================================ */

/**
 * Représente un article dans le panier d'achat.
 * Combine les informations produit avec la quantité et la taille sélectionnée.
 */
export interface CartItem {
  /** Référence unique de l'article dans le panier (productId + size) */
  cartItemId: string
  /** Produit associé */
  product: Product
  /** Taille sélectionnée par l'utilisateur */
  selectedSize: ProductSize
  /** Quantité commandée */
  quantity: number
  /** Prix unitaire au moment de l'ajout (capture du prix) */
  priceAtAdd: number
}

/**
 * État global du panier géré par Zustand.
 */
export interface CartState {
  /** Liste des articles dans le panier */
  items: CartItem[]
  /** Indique si le drawer mini-panier est ouvert */
  isOpen: boolean
  /** Nombre total d'articles (somme des quantités) */
  totalItems: number
  /** Montant total en euros */
  totalPrice: number
}

/**
 * Actions disponibles sur le panier (store Zustand).
 */
export interface CartActions {
  /** Ajoute un produit avec une taille sélectionnée au panier */
  addItem: (product: Product, size: ProductSize) => void
  /** Retire un article du panier par son cartItemId */
  removeItem: (cartItemId: string) => void
  /** Met à jour la quantité d'un article */
  updateQuantity: (cartItemId: string, quantity: number) => void
  /** Vide entièrement le panier */
  clearCart: () => void
  /** Ouvre le drawer mini-panier */
  openCart: () => void
  /** Ferme le drawer mini-panier */
  closeCart: () => void
  /** Bascule l'état ouvert/fermé du drawer */
  toggleCart: () => void
}

/* ============================================================
 * INTERFACES FILTRES
 * ============================================================ */

/**
 * Représente une option de filtre (ex. une marque, une couleur, une taille).
 */
export interface FilterOption {
  /** Valeur de filtre utilisée dans les requêtes */
  value: string
  /** Libellé affiché dans l'interface */
  label: string
  /** Nombre de produits correspondants */
  count: number
  /** Indique si ce filtre est actuellement sélectionné */
  selected: boolean
}

/**
 * Représente un groupe de filtres (ex. "Marque", "Taille", "Couleur").
 */
export interface FilterGroup {
  /** Identifiant du groupe */
  id: string
  /** Nom affiché dans l'accordéon de filtres */
  label: string
  /** Options disponibles dans ce groupe */
  options: FilterOption[]
  /** Indique si l'accordéon est ouvert par défaut */
  defaultOpen: boolean
}

/**
 * État des filtres actifs pour la page liste de produits.
 */
export interface ActiveFilters {
  /** Marques sélectionnées */
  brands: string[]
  /** Tailles sélectionnées */
  sizes: string[]
  /** Couleurs sélectionnées */
  colors: string[]
  /** Fourchette de prix : [min, max] */
  priceRange: [number, number]
  /** Genres sélectionnés */
  genres: Genre[]
  /** Option de tri */
  sortBy: SortOption
  /** Terme de recherche */
  searchQuery: string
}

/* ============================================================
 * INTERFACES NAVIGATION
 * ============================================================ */

/**
 * Représente une colonne du mega-menu avec ses sous-catégories.
 */
export interface MegaMenuColumn {
  /** Titre de la colonne */
  title: string
  /** Liens de la colonne */
  links: MegaMenuLink[]
}

/**
 * Représente un lien dans le mega-menu.
 */
export interface MegaMenuLink {
  /** Texte affiché */
  label: string
  /** URL de destination */
  href: string
  /** Indique si c'est un lien mis en avant (bold) */
  highlighted?: boolean
}

/**
 * Représente un bloc image dans le mega-menu.
 */
export interface MegaMenuImageBlock {
  /** URL de l'image illustrative */
  imageSrc: string
  /** Texte alternatif de l'image */
  imageAlt: string
  /** Titre affiché sous l'image */
  title: string
  /** URL de destination au clic */
  href: string
}

/**
 * Représente un élément de la navigation principale.
 */
export interface NavItem {
  /** Label affiché dans la barre de navigation */
  label: string
  /** URL directe (si pas de mega-menu) */
  href: string
  /** Colonnes du mega-menu (si applicable) */
  megaMenuColumns?: MegaMenuColumn[]
  /** Blocs images du mega-menu (si applicable) */
  megaMenuImages?: MegaMenuImageBlock[]
  /** Indique si cet item a un mega-menu */
  hasMegaMenu: boolean
  /** Mise en avant visuelle (ex. "Sale" en rouge) */
  highlighted?: boolean
}

/* ============================================================
 * INTERFACES UI
 * ============================================================ */

/**
 * Configuration d'une notification toast.
 */
export interface ToastConfig {
  /** Identifiant unique du toast */
  id: string
  /** Message affiché */
  message: string
  /** Type de toast (succès, erreur, info) */
  type: 'success' | 'error' | 'info'
  /** Durée d'affichage en millisecondes */
  duration?: number
}

/**
 * Props communes aux composants de mise en page.
 */
export interface LayoutProps {
  /** Contenu enfant React */
  children: React.ReactNode
  /** Classe CSS additionnelle */
  className?: string
}

/**
 * Résultat paginé pour la liste de produits.
 */
export interface PaginatedProducts {
  /** Produits de la page courante */
  products: Product[]
  /** Nombre total de produits correspondant aux filtres */
  total: number
  /** Numéro de la page courante */
  page: number
  /** Nombre de produits par page */
  pageSize: number
  /** Indique s'il existe une page suivante */
  hasNextPage: boolean
}
