'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProduitImage { url: string; ordre: number; isHover: boolean }
interface ProduitTaille { id: string; label: string; stock: number; disponible: boolean }
interface Collection { id: string; slug: string; nom: string }
interface Produit {
  id: string; slug: string; nom: string; description: string | null
  prix: number; prixOriginal: number | null; marque: string
  genre: string; statut: string; stock: number; categorie: string
  images: ProduitImage[]; tailles: ProduitTaille[]
  collection: Collection | null
}

const STATUT_LABEL: Record<string, string> = {
  NEW: 'Nouveau', EXCLUSIVE: 'Exclusif', SALE: 'Solde', STANDARD: '',
}
const STATUT_COLOR: Record<string, string> = {
  NEW: 'bg-end-black text-end-white',
  EXCLUSIVE: 'bg-amber-600 text-white',
  SALE: 'bg-red-600 text-white',
}
const fmt = (n: number) => n.toLocaleString('fr-FR')

// ── Composant principal ───────────────────────────────────────────────────────
export default function ProduitBoutiqueClient({ slug }: { slug: string }) {
  const { addItem } = useCart()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedTaille, setSelectedTaille] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    fetch(`/api/produits?slug=${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const p = data?.produits?.[0] ?? null
        setProduit(p)
        if (p?.tailles?.length) {
          const first = p.tailles.find((t: ProduitTaille) => t.disponible && t.stock > 0)
          if (first) setSelectedTaille(first.label)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!produit || !selectedTaille) return
    const mainImg = produit.images[0]?.url ?? ''
    // Adapter au format Product du store (id, slug, brand, name, price, mainImage...)
    const product = {
      id: produit.id,
      slug: produit.slug,
      brand: produit.marque,
      name: produit.nom,
      price: produit.prix,
      originalPrice: produit.prixOriginal ?? undefined,
      mainImage: { src: mainImg, alt: produit.nom, width: 800, height: 1067 },
      hoverImage: { src: produit.images[1]?.url ?? mainImg, alt: produit.nom, width: 800, height: 1067 },
      images: produit.images.map(i => i.url),
      sizes: produit.tailles.map(t => ({ label: t.label, value: t.label, inStock: t.disponible && t.stock > 0 })),
      gallery: [],
      color: '',
      category: produit.categorie,
      status: produit.statut.toLowerCase() as 'new' | 'exclusive' | 'sale' | 'standard',
      stock: produit.stock,
      addedAt: '',
      featured: false,
      tags: [],
    }
    const size = { label: selectedTaille, value: selectedTaille, inStock: true }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addItem(product as any, size)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  // ── Loading ──
  if (loading) {
    return (
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-[3/4] bg-end-gray-light animate-pulse" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-end-gray-light rounded w-1/4 animate-pulse" />
            <div className="h-7 bg-end-gray-light rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-end-gray-light rounded w-1/3 animate-pulse" />
          </div>
        </div>
      </main>
    )
  }

  // ── Produit introuvable ──
  if (!produit) {
    return (
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-xl font-bold text-end-black mb-4">Produit introuvable</p>
        <Link href="/boutique" className="text-sm underline text-end-gray-dark hover:text-end-black">
          Retour à la boutique
        </Link>
      </main>
    )
  }

  const images = produit.images.length > 0 ? produit.images : [{ url: '/images/prod-h1-main.jpg', ordre: 0, isHover: false }]
  const currentImg = images[activeImg] ?? images[0]

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-6" aria-label="Fil d'ariane">
        <Link href="/" className="hover:text-end-black transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/boutique" className="hover:text-end-black transition-colors">Ma Boutique</Link>
        {produit.collection && (
          <>
            <span>/</span>
            <Link href={`/boutique?collection=${produit.collection.slug}`} className="hover:text-end-black transition-colors">
              {produit.collection.nom}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-end-black font-medium truncate max-w-xs">{produit.nom}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* ── Galerie (gauche) ── */}
        <div className="flex gap-3">
          {/* Miniatures verticales */}
          {images.length > 1 && (
            <div className="flex flex-col gap-2 w-16 sm:w-20 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`block w-full aspect-[3/4] overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    activeImg === i ? 'border-end-black' : 'border-transparent hover:border-end-gray-border'
                  }`}
                  aria-label={`Vue ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Image principale */}
          <div className="flex-1 aspect-[3/4] overflow-hidden bg-end-gray-light relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImg.url}
              alt={produit.nom}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Badge statut */}
            {STATUT_LABEL[produit.statut] && (
              <div className="absolute top-3 left-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 ${STATUT_COLOR[produit.statut]}`}>
                  {STATUT_LABEL[produit.statut]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Infos produit (droite) ── */}
        <div className="pt-0 lg:pt-4">
          {/* Marque + collection */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-end-gray-mid uppercase tracking-widest font-semibold">{produit.marque}</p>
            {produit.collection && (
              <>
                <span className="text-end-gray-border">·</span>
                <Link href={`/boutique?collection=${produit.collection.slug}`}
                  className="text-xs text-end-gray-dark uppercase tracking-wider hover:text-end-black transition-colors font-medium">
                  {produit.collection.nom}
                </Link>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-end-black leading-tight mb-4">{produit.nom}</h1>

          {/* Prix */}
          <div className="flex items-center gap-3 mb-6">
            {produit.prixOriginal && (
              <span className="text-base text-end-gray-mid line-through">{fmt(produit.prixOriginal)} XOF</span>
            )}
            <span className={`text-2xl font-bold ${produit.prixOriginal ? 'text-red-600' : 'text-end-black'}`}>
              {fmt(produit.prix)} XOF
            </span>
          </div>

          {/* Genre */}
          <p className="text-xs text-end-gray-mid uppercase tracking-widest mb-5">
            {produit.genre === 'HOMME' ? 'Collection Homme' : produit.genre === 'FEMME' ? 'Collection Femme' : 'Collection Unisexe'}
          </p>

          {/* Sélecteur de taille */}
          {produit.tailles.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-end-black">Taille</p>
                <button className="text-xs text-end-gray-dark underline underline-offset-2 hover:text-end-black transition-colors">
                  Guide des tailles
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {produit.tailles.map(t => {
                  const dispo = t.disponible && t.stock > 0
                  return (
                    <button
                      key={t.id}
                      disabled={!dispo}
                      onClick={() => dispo && setSelectedTaille(t.label)}
                      className={`min-w-[2.75rem] px-3 h-10 text-xs font-semibold uppercase border transition-colors ${
                        selectedTaille === t.label
                          ? 'bg-end-black text-end-white border-end-black'
                          : dispo
                          ? 'bg-white text-end-black border-end-gray-border hover:border-end-black'
                          : 'bg-white text-end-gray-border border-end-gray-border cursor-not-allowed line-through opacity-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bouton ajout au panier */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedTaille || produit.stock === 0}
            className={`w-full py-4 text-sm font-bold uppercase tracking-wider transition-colors mb-3 ${
              added
                ? 'bg-green-600 text-white'
                : selectedTaille && produit.stock > 0
                ? 'bg-end-blue text-white hover:opacity-80'
                : 'bg-end-gray-light text-end-gray-mid cursor-not-allowed'
            }`}
          >
            {added ? '✓ Ajouté au panier' : produit.stock === 0 ? 'Rupture de stock' : selectedTaille ? 'Ajouter au panier' : 'Choisir une taille'}
          </button>

          {/* Stock faible */}
          {produit.stock > 0 && produit.stock <= 5 && (
            <p className="text-xs text-amber-600 font-semibold text-center mb-4">
              Plus que {produit.stock} article{produit.stock !== 1 ? 's' : ''} en stock
            </p>
          )}

          {/* Description */}
          {produit.description && (
            <div className="border-t border-end-gray-border pt-5 mt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-end-black mb-3">Description</h2>
              <p className="text-sm text-end-gray-dark leading-relaxed">{produit.description}</p>
            </div>
          )}

          {/* Infos livraison */}
          <div className="border-t border-end-gray-border pt-5 mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-end-gray-dark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h9M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 4h2a1 1 0 011 1v3a1 1 0 01-1 1h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Livraison gratuite dès 50 000 XOF
            </div>
            <div className="flex items-center gap-2 text-xs text-end-gray-dark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4h4l-3 2.5 1 4L7 9l-3.5 2.5 1-4L1 5h4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              Retours sous 28 jours
            </div>
            <div className="flex items-center gap-2 text-xs text-end-gray-dark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7l1.5 1.5L9 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Authenticité WOG-STYLE garantie
            </div>
          </div>

          {/* Retour boutique */}
          <div className="mt-6">
            <Link href="/boutique" className="flex items-center gap-1.5 text-xs text-end-gray-dark hover:text-end-black transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
