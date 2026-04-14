/**
 * @fichier app/product/[slug]/ProductDetailClient.tsx
 * @rôle Partie interactive de la fiche produit (Client Component).
 *        Gère la sélection de taille, l'ajout au panier avec animation de confirmation,
 *        les accordéons d'information et les produits similaires.
 * @dépendances react, framer-motion, hooks/useCart, components/ui/Toast,
 *              components/product/ProductGallery, components/product/SizeSelector,
 *              components/product/ProductCard, components/ui/Button, components/ui/Accordion
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/Toast'
import { ProductGallery } from '@/components/product/ProductGallery'
import { SizeSelector } from '@/components/product/SizeSelector'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { AccordionItem } from '@/components/ui/Accordion'
import type { Product, ProductSize } from '@/types'

/* ============================================================
 * INTERFACES
 * ============================================================ */

/**
 * Props du composant ProductDetailClient.
 */
interface ProductDetailClientProps {
  /** Produit principal affiché */
  product: Product
  /** Produits similaires affichés en bas de page */
  similarProducts: Product[]
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * ProductDetailClient — composant interactif de la fiche produit.
 *
 * Gère :
 * - La sélection de taille avec validation
 * - L'ajout au panier avec toast de confirmation
 * - L'animation du bouton "Add to Bag"
 * - Les accordéons d'information détaillée
 *
 * @param product         - Données du produit à afficher
 * @param similarProducts - Produits de même catégorie pour la section suggestions
 */
export default function ProductDetailClient({
  product,
  similarProducts,
}: ProductDetailClientProps) {
  /* Taille sélectionnée par l'utilisateur */
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)

  /* État d'erreur quand l'utilisateur clique "Add to Bag" sans taille */
  const [sizeError, setSizeError] = useState<boolean>(false)

  /* État temporaire de confirmation après ajout au panier */
  const [addedConfirm, setAddedConfirm] = useState<boolean>(false)

  /* Accès aux actions du panier */
  const { addItem } = useCart()

  /* Accès au système de toasts */
  const { showToast } = useToast()

  /**
   * Formate un prix en chaîne euros lisible.
   *
   * @param price - Montant en euros
   * @returns Chaîne formatée (ex. "130,00 €")
   */
  const formatPrice = (price: number): string =>
    price.toLocaleString('fr-FR') + ' XOF'

  /**
   * Gère la sélection d'une taille.
   * Efface l'état d'erreur au moment de la sélection.
   *
   * @param size - Taille sélectionnée par l'utilisateur
   */
  const handleSizeSelect = (size: ProductSize): void => {
    setSelectedSize(size)
    setSizeError(false)
  }

  /**
   * Gère l'ajout du produit au panier.
   * Valide que l'utilisateur a sélectionné une taille avant d'ajouter.
   * Affiche un toast de confirmation et l'animation du bouton.
   */
  const handleAddToBag = (): void => {
    /* Validation : taille obligatoire */
    if (!selectedSize) {
      setSizeError(true)
      /* Scroll smooth vers le sélecteur de taille */
      document.getElementById('size-selector')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return
    }

    /* Ajout au panier via le store Zustand */
    addItem(product, selectedSize)

    /* Affichage du toast de confirmation */
    showToast({
      type: 'success',
      message: `${product.brand} ${product.name} ajouté au panier`,
      duration: 4000,
    })

    /* Animation de confirmation du bouton (2 secondes) */
    setAddedConfirm(true)
    setTimeout(() => setAddedConfirm(false), 2000)
  }

  return (
    <div>

      {/* === FIL D'ARIANE ===
          Navigation contextuelle pour l'accessibilité et le SEO */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Fil d'Ariane">
          <ol className="flex items-center gap-2 text-xs text-end-gray-mid">
            <li><Link href="/" className="hover:text-end-black transition-colors">Accueil</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href="/sneakers" className="hover:text-end-black transition-colors capitalize">{product.category}</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/brands/${product.brandId}`} className="hover:text-end-black transition-colors">{product.brand}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-end-black font-medium truncate max-w-48">{product.name}</li>
          </ol>
        </nav>
      </div>

      {/* === CORPS DE LA FICHE PRODUIT ===
          Grid 2 colonnes : galerie à gauche, infos à droite */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* === COLONNE GALERIE ===
              Miniatures + image principale + zoom */}
          <div className="lg:sticky lg:top-24 self-start">
            <ProductGallery
              images={product.gallery}
              productName={`${product.brand} ${product.name}`}
            />
          </div>

          {/* === COLONNE INFORMATIONS PRODUIT === */}
          <div className="flex flex-col gap-6">

            {/* Badge de statut */}
            {product.status !== 'standard' && product.status !== 'sold_out' && (
              <div>
                <span
                  className={`inline-block px-2 py-0.5 text-2xs font-bold uppercase tracking-wider ${
                    product.status === 'new' ? 'bg-end-black text-end-white' :
                    product.status === 'exclusive' ? 'bg-end-gray-dark text-end-white' :
                    'bg-end-red text-end-white'
                  }`}
                >
                  {product.status === 'new' ? 'New In' : product.status === 'exclusive' ? 'Exclusive' : 'Sale'}
                </span>
              </div>
            )}

            {/* Nom de la marque + nom du produit */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-1">
                {product.brand}
              </p>
              <h1 className="text-2xl font-black uppercase leading-tight text-end-black">
                {product.name}
              </h1>
              <p className="text-xs text-end-gray-mid mt-1">{product.color}</p>
            </div>

            {/* Zone prix */}
            <div className="flex items-center gap-3">
              {/* Prix actuel */}
              <span
                className={`text-2xl font-bold ${
                  product.status === 'sale' ? 'text-end-red' : 'text-end-black'
                }`}
              >
                {formatPrice(product.price)}
              </span>
              {/* Prix original barré si soldé */}
              {product.originalPrice && (
                <>
                  <span className="text-lg text-end-gray-mid line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm font-bold text-end-red">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Sélecteur de taille */}
            <div id="size-selector">
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSelectSize={handleSizeSelect}
                hasError={sizeError}
              />
            </div>

            {/* Bouton Add to Bag avec animation de confirmation */}
            <motion.div
              animate={addedConfirm ? { scale: [1, 0.97, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant={addedConfirm ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                onClick={handleAddToBag}
                disabled={product.status === 'sold_out'}
              >
                {product.status === 'sold_out'
                  ? 'Épuisé'
                  : addedConfirm
                  ? '✓ Ajouté au panier'
                  : 'Ajouter au panier'}
              </Button>
            </motion.div>

            {/* Lien wishlist */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 text-xs text-end-gray-mid hover:text-end-black transition-colors uppercase tracking-wider"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 14s-6-4.35-6-8a4 4 0 018 0 4 4 0 018 0c0 3.65-6 8-6 8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Ajouter à ma liste
            </button>

            {/* Accordéons d'information produit */}
            <div className="border-t border-end-gray-border pt-2">

              {/* Accordéon Description */}
              <AccordionItem title="Description" defaultOpen={true}>
                <p className="text-sm text-end-gray-dark leading-relaxed">
                  {product.description}
                </p>
                <p className="text-sm text-end-gray-dark leading-relaxed mt-3">
                  <strong className="text-end-black">Composition :</strong>{' '}
                  {product.composition}
                </p>
                <p className="text-xs text-end-gray-mid mt-2">
                  Référence : {product.sku}
                </p>
              </AccordionItem>

              {/* Accordéon Guide des tailles */}
              <AccordionItem title="Guide des tailles">
                <p className="text-sm text-end-gray-dark mb-3">
                  Pour les sneakers, nous recommandons de prendre votre taille habituelle.
                  En cas de doute entre deux tailles, optez pour la taille supérieure.
                </p>
                {/* Tableau de correspondance de tailles */}
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-end-gray-border">
                      <th className="text-left py-2 font-semibold uppercase tracking-wider">EU</th>
                      <th className="text-left py-2 font-semibold uppercase tracking-wider">UK</th>
                      <th className="text-left py-2 font-semibold uppercase tracking-wider">US</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['40', '6.5', '7'],
                      ['41', '7', '7.5'],
                      ['42', '8', '8.5'],
                      ['43', '9', '9.5'],
                      ['44', '9.5', '10'],
                      ['45', '10.5', '11'],
                    ].map(([eu, uk, us]) => (
                      <tr key={eu} className="border-b border-end-gray-border">
                        <td className="py-2 text-end-gray-dark">{eu}</td>
                        <td className="py-2 text-end-gray-dark">{uk}</td>
                        <td className="py-2 text-end-gray-dark">{us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionItem>

              {/* Accordéon Livraison & Retours */}
              <AccordionItem title="Livraison et retours">
                <div className="space-y-3 text-sm text-end-gray-dark">
                  <div>
                    <p className="font-semibold text-end-black mb-1">Livraison standard</p>
                    <p>3-5 jours ouvrés — Gratuite dès 50 000 XOF d'achat</p>
                  </div>
                  <div>
                    <p className="font-semibold text-end-black mb-1">Livraison express</p>
                    <p>1-2 jours ouvrés — 3 500 XOF</p>
                  </div>
                  <div>
                    <p className="font-semibold text-end-black mb-1">Retours</p>
                    <p>Retours gratuits sous 28 jours. Les articles doivent être dans leur état d'origine avec les étiquettes attachées.</p>
                  </div>
                </div>
              </AccordionItem>

              {/* Accordéon Authenticité */}
              <AccordionItem title="Authenticité">
                <p className="text-sm text-end-gray-dark leading-relaxed">
                  WOG-STYLE s'engage à ne proposer que des pièces 100% authentiques,
                  conçues et fabriquées dans nos ateliers partenaires.
                  Chaque article est contrôlé avant expédition.
                </p>
                <p className="text-sm text-end-gray-dark leading-relaxed mt-2">
                  En cas de doute sur l'authenticité d'un article reçu, contactez notre
                  service client sous 48h.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* === SECTION PRODUITS SIMILAIRES ===
          Affichée uniquement s'il y a des suggestions */}
      {similarProducts.length > 0 && (
        <section className="border-t border-end-gray-border py-12">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

            <h2 className="text-sm font-bold uppercase tracking-widest text-end-black mb-6">
              Vous pourriez aussi aimer
            </h2>

            {/* Grille de produits similaires */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-end-gray-border">
              {similarProducts.map((similar, index) => (
                <div key={similar.id} className="bg-end-white p-3">
                  <ProductCard product={similar} index={index} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
