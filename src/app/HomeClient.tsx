'use client'

/**
 * @fichier app/HomeClient.tsx
 * @rôle Partie interactive de la page d'accueil WOG-STYLE.
 *       Gère le filtre de genre (HOMME/FEMME/UNISEXE) et affiche
 *       la section Shop Category en horizontal scroll filtré.
 */

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'
import { FashionSlider } from '@/components/FashionSlider'

interface HomeClientProps {
  products: Product[]
}

type Genre = 'HOMME' | 'FEMME' | 'UNISEXE' | null

export const HomeClient: React.FC<HomeClientProps> = ({ products }) => {
  const [activeGenre, setActiveGenre] = useState<Genre>(null)
  const [brandFocusIndex, setBrandFocusIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Filtrage produits par genre sélectionné */
  const filteredProducts = activeGenre
    ? products.filter((p) => {
        const g = p.genre?.toUpperCase()
        return g === activeGenre || g === 'UNISEXE'
      })
    : products

  const shopProducts = filteredProducts.slice(0, 8)

  /* Images Brand Focus : paires image éditoriale + produits associés */
  const brandFocusSlides = [
    {
      editorial: '/images/wog-hom-1.jpg',
      label: 'WOG HOMME',
      desc: "Silhouettes taillées pour l'homme moderne. Des pièces qui parlent sans crier.",
      href: '/collection?genre=homme',
      products: products.filter((p) => p.genre?.toUpperCase() === 'HOMME').slice(0, 3),
    },
    {
      editorial: '/images/wog-fem-1.jpg',
      label: 'WOG FEMME',
      desc: 'La féminité en mouvement. Collections pensées pour la femme contemporaine.',
      href: '/collection?genre=femme',
      products: products.filter((p) => p.genre?.toUpperCase() === 'FEMME').slice(0, 3),
    },
    {
      editorial: '/images/unisex-1.jpg',
      label: 'UNISEXE',
      desc: "Sans genre. Sans limite. Des pièces qui s'appartiennent à tous.",
      href: '/collection?genre=unisexe',
      products: products.filter((p) => p.genre?.toUpperCase() === 'UNISEXE').slice(0, 3),
    },
  ]

  const currentSlide = brandFocusSlides[brandFocusIndex]

  /* Arrow SVG inline */
  const ArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <>
      {/* ============================================================
          SECTION NEWS — TRIPTYQUE ÉDITORIAL
          3 images côte-à-côte avec label + flèche (style editorial)
          ============================================================ */}
      <section className="bg-end-white py-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* En-tête section */}
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">
              News
            </h2>
            <Link
              href="/collection"
              className="text-xs font-semibold uppercase tracking-wider text-end-gray-mid hover:text-end-black transition-colors flex items-center gap-1"
            >
              Voir tout <ArrowRight />
            </Link>
          </div>

          {/* Triptyque — grille 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                src: '/images/vest-parf-1.jpg',
                label: 'LA VESTE PARFAITE',
                href: '/collection?categorie=vetements',
              },
              {
                src: '/images/hero-2.jpg',
                label: 'ÉDITIONS RARES',
                href: '/collection?categorie=editions-limitees',
              },
              {
                src: '/images/styleurb-1.jpg',
                label: 'STYLE URBAIN',
                href: '/collection',
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative block overflow-hidden bg-end-black"
                style={{ aspectRatio: '3/4' }}
              >
                {/* Image éditoriale — affichée en entier sans recadrage */}
                <img
                  src={item.src}
                  alt={`WOG-STYLE — ${item.label}`}
                  className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay dégradé bas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Label + flèche en bas */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-end-white">
                    {item.label}
                  </span>
                  <span className="text-end-white group-hover:translate-x-1 transition-transform">
                    <ArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* ============================================================
          SECTION BRAND FOCUS
          Grande image éditoriale gauche + slider produits droite
          avec pagination par points
          ============================================================ */}
      <section className="bg-end-white py-10 border-t border-end-gray-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* En-tête */}
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">
              Brand Focus
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Grande image éditoriale gauche */}
            <Link
              href={currentSlide.href}
              className="group relative block overflow-hidden"
              style={{ minHeight: '300px', height: '50vw', maxHeight: '600px' }}
            >
              <img
                src={currentSlide.editorial}
                alt={currentSlide.label}
                className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Texte superposé */}
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
                <p className="text-xs font-bold uppercase tracking-widest text-end-white/70 mb-1 sm:mb-2">
                  Collection
                </p>
                <h3 className="text-xl sm:text-3xl font-black uppercase text-end-white leading-none mb-2 sm:mb-3">
                  {currentSlide.label}
                </h3>
                <p className="text-xs sm:text-sm text-end-white/70 mb-3 sm:mb-5 leading-relaxed max-w-xs hidden sm:block">
                  {currentSlide.desc}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-end-white border-b border-end-white pb-0.5">
                  Découvrir <ArrowRight />
                </span>
              </div>
            </Link>

            {/* Colonne droite : produits + pagination */}
            <div className="bg-end-gray-light flex flex-col">

              {/* Mini-grille de 3 produits */}
              <div className="flex-1 grid grid-cols-3 divide-x divide-end-gray-border">
                {currentSlide.products.length > 0
                  ? currentSlide.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group block p-4 hover:bg-end-white transition-colors"
                      >
                        {/* Image produit */}
                        <div className="relative overflow-hidden mb-3" style={{ aspectRatio: '3/4' }}>
                          <img
                            src={product.images?.[0] ?? product.mainImage.src}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        {/* Infos produit */}
                        <p className="text-xs font-semibold text-end-black leading-tight mb-1 line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-end-gray-mid">
                          {product.price.toLocaleString('fr-FR')} XOF
                        </p>
                      </Link>
                    ))
                  : /* Placeholder si pas de produits pour ce genre */
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4">
                        <div className="bg-end-gray-border" style={{ aspectRatio: '3/4' }} />
                        <div className="h-3 bg-end-gray-border mt-3 rounded" />
                        <div className="h-3 bg-end-gray-border mt-2 w-2/3 rounded" />
                      </div>
                    ))}
              </div>

              {/* Pagination par points */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-end-gray-border">
                {/* Points de navigation */}
                <div className="flex items-center gap-2">
                  {brandFocusSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBrandFocusIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === brandFocusIndex
                          ? 'bg-end-black w-5'
                          : 'bg-end-gray-border hover:bg-end-gray-mid'
                      }`}
                    />
                  ))}
                </div>

                {/* Flèches prev/next */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBrandFocusIndex((prev) => (prev - 1 + brandFocusSlides.length) % brandFocusSlides.length)}
                    className="w-8 h-8 flex items-center justify-center border border-end-gray-border hover:border-end-black transition-colors"
                    aria-label="Précédent"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandFocusIndex((prev) => (prev + 1) % brandFocusSlides.length)}
                    className="w-8 h-8 flex items-center justify-center border border-end-gray-border hover:border-end-black transition-colors"
                    aria-label="Suivant"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION SHOP CATEGORY
          Filtre genre (HOMME/FEMME/UNISEXE) + scroll horizontal
          Cards produits centrées, fond blanc, sans bordure visible
          ============================================================ */}
      <section className="bg-end-white py-10 border-t border-end-gray-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* En-tête + filtres genre */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">
              Shop Category
            </h2>

            {/* Boutons de filtre genre — aucun sélectionné par défaut */}
            <div className="flex items-center gap-0 border border-end-gray-border">
              <button
                type="button"
                onClick={() => setActiveGenre(activeGenre === 'HOMME' ? null : 'HOMME')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeGenre === 'HOMME'
                    ? 'bg-end-black text-end-white'
                    : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Homme
              </button>
              <div className="w-px h-6 bg-end-gray-border" />
              <button
                type="button"
                onClick={() => setActiveGenre(activeGenre === 'FEMME' ? null : 'FEMME')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeGenre === 'FEMME'
                    ? 'bg-end-black text-end-white'
                    : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Femme
              </button>
              <div className="w-px h-6 bg-end-gray-border" />
              <button
                type="button"
                onClick={() => setActiveGenre(activeGenre === 'UNISEXE' ? null : 'UNISEXE')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeGenre === 'UNISEXE'
                    ? 'bg-end-black text-end-white'
                    : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Unisexe
              </button>
            </div>
          </div>

          {/* Scroll horizontal — cards produits */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {shopProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group flex-shrink-0 w-56 sm:w-64"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Container image — fond blanc, produit centré */}
                <div className="relative overflow-hidden bg-end-white" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={product.images?.[0] || "/images/placeholder.png"}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badge statut */}
                  {product.status !== 'standard' && (
                    <span className={`absolute top-2 left-2 text-2xs font-bold uppercase tracking-wider px-2 py-1 ${
                      product.status === 'new' ? 'bg-end-black text-end-white' :
                      product.status === 'exclusive' ? 'bg-end-black text-end-white' :
                      'bg-end-red text-end-white'
                    }`}>
                      {product.status === 'new' ? 'New' : product.status === 'exclusive' ? 'Exclusif' : 'Sale'}
                    </span>
                  )}
                </div>

                {/* Infos produit */}
                <div className="mt-3">
                  <p className="text-xs text-end-gray-mid uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </p>
                  <p className="text-sm font-semibold text-end-black leading-tight mb-2 line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-end-black">
                      {product.price.toLocaleString('fr-FR')} XOF
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-end-gray-mid line-through">
                        {product.originalPrice.toLocaleString('fr-FR')} XOF
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* Message si aucun produit */}
            {shopProducts.length === 0 && (
              <div className="flex items-center justify-center w-full py-16 text-end-gray-mid text-sm">
                Aucun produit pour cette sélection.
              </div>
            )}
          </div>

          {/* Lien voir tout */}
          <div className="mt-6 text-center">
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-end-black border-b border-end-black pb-0.5 hover:opacity-60 transition-opacity"
            >
              Voir toute la collection <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomeClient
