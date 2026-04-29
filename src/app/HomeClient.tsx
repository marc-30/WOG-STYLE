'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'

interface HomeClientProps {
  products: Product[]
}

type Genre = 'HOMME' | 'FEMME' | 'UNISEXE' | null

export const HomeClient: React.FC<HomeClientProps> = ({ products }) => {
  const [activeGenre, setActiveGenre] = useState<Genre>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredProducts = activeGenre
    ? products.filter((p) => {
        const g = p.genre?.toUpperCase()
        return g === activeGenre || g === 'UNISEXE'
      })
    : products

  const shopProducts = filteredProducts.slice(0, 8)

  const ArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <>
      {/* ============================================================
          SECTION NEWS — TRIPTYQUE ÉDITORIAL
          ============================================================ */}
      <section className="bg-end-white py-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">News</h2>
            <Link
              href="/boutique"
              className="text-xs font-semibold uppercase tracking-wider text-end-gray-mid hover:text-end-black transition-colors flex items-center gap-1"
            >
              Voir tout <ArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                src: '/images/vest-parf-1.jpg',
                label: 'LA VESTE PARFAITE',
                href: '/boutique?categorie=vetements',
              },
              {
                src: '/images/styleurb-1.jpg',
                label: 'STYLE URBAIN',
                href: '/boutique',
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative block overflow-hidden bg-end-black"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={item.src}
                  alt={`WOG-STYLE — ${item.label}`}
                  className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
          SECTION SHOP CATEGORY
          ============================================================ */}
      <section className="bg-end-white py-10 border-t border-end-gray-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">
              Shop Category
            </h2>

            <div className="flex items-center gap-0 border border-end-gray-border">
              <button
                type="button"
                onClick={() => setActiveGenre(activeGenre === 'HOMME' ? null : 'HOMME')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeGenre === 'HOMME' ? 'bg-end-black text-end-white' : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Homme
              </button>
              <div className="w-px h-6 bg-end-gray-border" />
              <button
                type="button"
                onClick={() => setActiveGenre(activeGenre === 'FEMME' ? null : 'FEMME')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeGenre === 'FEMME' ? 'bg-end-black text-end-white' : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Femme
              </button>
              <div className="w-px h-6 bg-end-gray-border" />
              <button
                type="button"
                onClick={() => setActiveGenre(activeGenre === 'UNISEXE' ? null : 'UNISEXE')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeGenre === 'UNISEXE' ? 'bg-end-black text-end-white' : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Unisexe
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {shopProducts.map((product) => (
              <Link
                key={product.id}
                href={`/boutique/${product.slug}`}
                className="group flex-shrink-0 w-56 sm:w-64"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="relative overflow-hidden bg-end-white" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={product.images?.[0] || '/images/placeholder.png'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                  />
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

                <div className="mt-3">
                  <p className="text-xs text-end-gray-mid uppercase tracking-wider mb-0.5">{product.brand}</p>
                  <p className="text-sm font-semibold text-end-black leading-tight mb-2 line-clamp-2">{product.name}</p>
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

            {shopProducts.length === 0 && (
              <div className="flex items-center justify-center w-full py-16 text-end-gray-mid text-sm">
                Aucun produit pour cette sélection.
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/boutique"
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
