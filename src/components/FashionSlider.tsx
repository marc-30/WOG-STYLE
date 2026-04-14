'use client'

/**
 * @fichier app/components/FashionSlider.tsx
 * @rôle Section slider de vêtements avec image statique masque à gauche.
 *        L'image statique (hauteur = 2 cards) est positionnée en z-index élevé.
 *        Les cards slident de droite vers gauche en passant DERRIÈRE ce masque.
 *        Navigation : boutons prev/next discrets (haut-droite) + drag souris + swipe tactile.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'

interface FashionSliderProps {
  products: Product[]
  title?: string
  subtitle?: string
  staticImage?: string
  staticLabel?: string
  staticSubLabel?: string
  staticHref?: string
}

export const FashionSlider: React.FC<FashionSliderProps> = ({
  products,
  title = 'Collection',
  subtitle = 'Nouveautés de la saison',
  staticImage = '/images/brand-editorial-1.jpg',
  staticLabel = 'WOG STYLE',
  staticSubLabel = 'Édition 2024',
  staticHref = '/collection',
}) => {
  const trackRef   = useRef<HTMLDivElement>(null)
  const wrapRef    = useRef<HTMLDivElement>(null)

  /* Offset de translation en px */
  const [offset, setOffset]   = useState(0)
  const [maxOff, setMaxOff]   = useState(0)

  /* Drag état */
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const startOffset = useRef(0)

  /* Largeur d'une card + gap (px) */
  const CARD_W = 224 + 16 // w-56 = 224px + gap-4 = 16px

  /* Arrow SVG inline — même style que HomeClient */
  const ArrowRight = () => (
    <svg width="18" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7h8M8 4l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  /* Recalculer le max offset quand le DOM est prêt */
  const recalc = useCallback(() => {
    if (!trackRef.current || !wrapRef.current) return
    const trackW = trackRef.current.scrollWidth
    const wrapW  = wrapRef.current.offsetWidth
    setMaxOff(Math.max(0, trackW - wrapW))
  }, [])

  useEffect(() => {
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [recalc, products])

  const clamp = (v: number) => Math.max(0, Math.min(v, maxOff))

  const moveTo = (v: number) => setOffset(clamp(v))

  /* Boutons prev / next — avancent de 2 cards */
  const goNext = () => moveTo(offset + CARD_W * 2)
  const goPrev = () => moveTo(offset - CARD_W * 2)

  /* ── Drag souris ── */
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current  = true
    startX.current      = e.clientX
    startOffset.current = offset
  }
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    moveTo(startOffset.current - (e.clientX - startX.current))
  }, [offset, maxOff])
  const onMouseUp = useCallback(() => { isDragging.current = false }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  /* ── Swipe tactile ── */
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current  = true
    startX.current      = e.touches[0].clientX
    startOffset.current = offset
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    moveTo(startOffset.current - (e.touches[0].clientX - startX.current))
  }
  const onTouchEnd = () => { isDragging.current = false }

  /* ── Largeur de l'image statique : même valeur que le padding-left du track ── */
  const STATIC_W = 240 // px — à ajuster selon vos images

  return (
    <section className="bg-end-white py-10 border-t border-end-gray-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── En-tête ── */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">
              {title}
            </h2>
            <p className="text-xs text-end-gray-mid mt-0.5">{subtitle}</p>
          </div>

          {/* Boutons prev / next discrets */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={offset <= 0}
              aria-label="Précédent"
              className="w-8 h-8 flex items-center justify-center border border-end-gray-border hover:border-end-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={offset >= maxOff}
              aria-label="Suivant"
              className="w-8 h-8 flex items-center justify-center border border-end-gray-border hover:border-end-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Zone principale : image statique + slider ── */}
        <div className="relative" style={{ overflow: 'hidden' }}>

          {/* ── Track scrollable (overflow caché, commence APRÈS l'image statique) ── */}
          <div
            ref={wrapRef}
            className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{ paddingLeft: `${STATIC_W + 16}px` }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={trackRef}
              className="flex gap-4 pb-2"
              style={{
                transform:  `translateX(-${offset}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform',
              }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group flex-shrink-0 w-56"
                  draggable={false}
                >
                  {/* Image produit — fond blanc, sans bordure visible */}
                  <div
                    className="relative overflow-hidden bg-end-white"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <img
                      src={product.images?.[0] || '/images/placeholder.png'}
                      alt={product.name}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.status !== 'standard' && (
                      <span
                        className={`absolute top-2 left-2 text-2xs font-bold uppercase tracking-wider px-2 py-1 ${
                          product.status === 'new'
                            ? 'bg-end-black text-end-white'
                            : product.status === 'exclusive'
                            ? 'bg-end-black text-end-white'
                            : 'bg-end-red text-end-white'
                        }`}
                      >
                        {product.status === 'new'
                          ? 'New'
                          : product.status === 'exclusive'
                          ? 'Exclusif'
                          : 'Sale'}
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
            </div>
          </div>

          {/* ── Image statique masque — positionnée ABSOLUE à gauche, z-index élevé ──
               Hauteur = 2 × (hauteur card image 3/4 × w-56) + gap + infos produit
               soit environ 650px. On utilise une valeur fixe ajustable. ── */}
          <Link
            href={staticHref}
            className="group absolute top-0 left-0 flex-shrink-0 overflow-hidden"
            style={{
              width:   `${STATIC_W}px`,
              /* Hauteur = ~2 images 3/4 + gap + 2 × bloc texte */
              height:  'calc(2 * (224px * 4 / 3) + 16px)',
              zIndex:  10,
            }}
            draggable={false}
          >
            <img
              src={staticImage}
              alt={staticLabel}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay dégradé bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            {/* Label en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-2xs font-bold uppercase tracking-widest text-end-white/60 mb-1">
                {staticSubLabel}
              </p>
              <h3 className="text-lg font-black uppercase text-end-white leading-none mb-3">
                {staticLabel}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-end-white border-b border-end-white/60 pb-0.5 group-hover:border-end-white transition-colors">
                Voir <ArrowRight />
              </span>
            </div>
          </Link>

          {/* Fondu côté droit pour indiquer qu'il y a encore des items */}
          <div
            className="absolute top-0 right-0 bottom-0 pointer-events-none"
            style={{
              width:      '60px',
              background: 'linear-gradient(to right, transparent, var(--color-bg-white, white))',
              zIndex:     5,
            }}
          />
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
  )
}

export default FashionSlider
