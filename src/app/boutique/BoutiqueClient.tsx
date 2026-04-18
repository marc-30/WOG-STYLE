'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProduitImage {
  url: string
  ordre: number
  isHover: boolean
}

interface ProduitTaille {
  id: string
  label: string
  stock: number
  disponible: boolean
}

interface Collection {
  id: string
  slug: string
  nom: string
}

interface Produit {
  id: string
  slug: string
  nom: string
  prix: number
  prixOriginal: number | null
  marque: string
  genre: 'HOMME' | 'FEMME' | 'UNISEXE'
  statut: 'NEW' | 'EXCLUSIVE' | 'SALE' | 'STANDARD'
  stock: number
  categorie: string
  images: ProduitImage[]
  tailles: ProduitTaille[]
  collection: Collection | null
}

// ── Labels ────────────────────────────────────────────────────────────────────
const STATUT_LABEL: Record<string, string> = {
  NEW: 'Nouveau', EXCLUSIVE: 'Exclusif', SALE: 'Solde', STANDARD: '',
}
const STATUT_COLOR: Record<string, string> = {
  NEW: 'bg-end-black text-end-white',
  EXCLUSIVE: 'bg-amber-600 text-white',
  SALE: 'bg-red-600 text-white',
}
const CATEGORIE_LABEL: Record<string, string> = {
  vetements: 'Vêtements',
  accessoires: 'Accessoires',
  'editions-limitees': 'Éditions limitées',
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

// ── Composant carte produit ───────────────────────────────────────────────────
function ProductCard({ produit }: { produit: Produit }) {
  const mainImg = produit.images.find(i => !i.isHover && i.ordre === 0) ?? produit.images[0]
  const hoverImg = produit.images.find(i => i.isHover) ?? produit.images[1] ?? produit.images[0]
  const thumbs = produit.images.slice(0, 4)

  return (
    <Link href={`/boutique/${produit.slug}`} className="group block">
      {/* Image principale avec hover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-end-gray-light">
        {/* Image de base */}
        {mainImg && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={mainImg.url}
            alt={produit.nom}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
        )}
        {/* Image hover (modèle) */}
        {hoverImg && hoverImg.url !== mainImg?.url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={hoverImg.url}
            alt={`${produit.nom} — vue alternative`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          />
        )}

        {/* Badges statut */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {STATUT_LABEL[produit.statut] && (
            <span className={`text-2xs font-bold uppercase tracking-wider px-2 py-0.5 ${STATUT_COLOR[produit.statut]}`}>
              {STATUT_LABEL[produit.statut]}
            </span>
          )}
          {produit.collection && (
            <span className="text-2xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-white/90 text-end-black">
              {produit.collection.nom}
            </span>
          )}
        </div>

        {/* Badge genre — desktop uniquement */}
        <div className="absolute top-2 right-2 hidden sm:block">
          <span className="text-2xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-white/80 text-end-gray-dark">
            {produit.genre === 'HOMME' ? 'H' : produit.genre === 'FEMME' ? 'F' : 'U'}
          </span>
        </div>

        {/* Bouton rapide au hover */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-end-black text-end-white text-xs font-semibold uppercase tracking-wider text-center py-2.5">
            Voir le produit
          </div>
        </div>
      </div>

      {/* Miniatures (angles de vue) */}
      {thumbs.length > 1 && (
        <div className="flex gap-1 mt-1">
          {thumbs.map((img, i) => (
            <div key={i} className="w-8 h-10 sm:w-10 sm:h-12 overflow-hidden bg-end-gray-light flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Infos produit */}
      <div className="mt-2">
        <p className="text-xs text-end-gray-mid uppercase tracking-wider truncate">{produit.marque}</p>
        <p className="text-sm font-semibold text-end-black mt-0.5 truncate leading-snug">{produit.nom}</p>
        <div className="flex items-center gap-2 mt-1">
          {produit.prixOriginal && (
            <span className="text-xs text-end-gray-mid line-through">{fmt(produit.prixOriginal)} XOF</span>
          )}
          <span className={`text-sm font-bold ${produit.prixOriginal ? 'text-red-600' : 'text-end-black'}`}>
            {fmt(produit.prix)} XOF
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Composant filtre (sidebar) ─────────────────────────────────────────────────
interface FilterState {
  genre: string
  categorie: string
  collection: string
  statut: string
}

function FilterPanel({
  filters,
  onChange,
  collections,
  total,
  onClose,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  collections: Collection[]
  total: number
  onClose?: () => void
}) {
  const set = (key: keyof FilterState, val: string) =>
    onChange({ ...filters, [key]: filters[key] === val ? '' : val })

  const hasActive = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-end-black">Filtres</h2>
        {hasActive && (
          <button
            onClick={() => onChange({ genre: '', categorie: '', collection: '', statut: '' })}
            className="text-xs text-end-gray-dark hover:text-end-black underline underline-offset-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <p className="text-xs text-end-gray-mid">{total} article{total !== 1 ? 's' : ''}</p>

      {/* Genre */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-end-black mb-3">Genre</h3>
        <div className="space-y-2">
          {['HOMME', 'FEMME', 'UNISEXE'].map(g => (
            <button
              key={g}
              onClick={() => set('genre', g)}
              className={`flex items-center gap-2 w-full text-left text-sm transition-colors ${
                filters.genre === g ? 'text-end-black font-semibold' : 'text-end-gray-dark hover:text-end-black'
              }`}
            >
              <span className={`w-3 h-3 border rounded-sm flex-shrink-0 transition-colors ${
                filters.genre === g ? 'bg-end-black border-end-black' : 'border-end-gray-border'
              }`} />
              {g === 'HOMME' ? 'Homme' : g === 'FEMME' ? 'Femme' : 'Unisexe'}
            </button>
          ))}
        </div>
      </div>

      {/* Catégorie */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-end-black mb-3">Catégorie</h3>
        <div className="space-y-2">
          {Object.entries(CATEGORIE_LABEL).map(([key, label]) => (
            <button
              key={key}
              onClick={() => set('categorie', key)}
              className={`flex items-center gap-2 w-full text-left text-sm transition-colors ${
                filters.categorie === key ? 'text-end-black font-semibold' : 'text-end-gray-dark hover:text-end-black'
              }`}
            >
              <span className={`w-3 h-3 border rounded-sm flex-shrink-0 transition-colors ${
                filters.categorie === key ? 'bg-end-black border-end-black' : 'border-end-gray-border'
              }`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-end-black mb-3">Collection</h3>
          <div className="space-y-2">
            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => set('collection', col.slug)}
                className={`flex items-center gap-2 w-full text-left text-sm transition-colors ${
                  filters.collection === col.slug ? 'text-end-black font-semibold' : 'text-end-gray-dark hover:text-end-black'
                }`}
              >
                <span className={`w-3 h-3 border rounded-sm flex-shrink-0 transition-colors ${
                  filters.collection === col.slug ? 'bg-end-black border-end-black' : 'border-end-gray-border'
                }`} />
                {col.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statut */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-end-black mb-3">Type</h3>
        <div className="space-y-2">
          {[
            { key: 'NEW', label: 'Nouveautés' },
            { key: 'EXCLUSIVE', label: 'Exclusivités' },
            { key: 'SALE', label: 'Soldes' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => set('statut', key)}
              className={`flex items-center gap-2 w-full text-left text-sm transition-colors ${
                filters.statut === key ? 'text-end-black font-semibold' : 'text-end-gray-dark hover:text-end-black'
              }`}
            >
              <span className={`w-3 h-3 border rounded-sm flex-shrink-0 transition-colors ${
                filters.statut === key ? 'bg-end-black border-end-black' : 'border-end-gray-border'
              }`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full bg-end-black text-end-white text-xs font-semibold uppercase tracking-wider py-3 mt-2"
        >
          Voir les résultats ({total})
        </button>
      )}
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function BoutiqueClient() {
  const searchParams = useSearchParams()
  const [allProduits, setAllProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    genre: searchParams.get('genre') ?? '',
    categorie: searchParams.get('categorie') ?? '',
    collection: searchParams.get('collection') ?? '',
    statut: searchParams.get('statut') ?? '',
  })

  // Charger tous les produits depuis la DB
  useEffect(() => {
    setLoading(true)
    fetch('/api/produits')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAllProduits(data.produits ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filtrer côté client pour UX instantanée
  const filtered = allProduits.filter(p => {
    if (filters.genre && p.genre !== filters.genre) return false
    if (filters.categorie && p.categorie !== filters.categorie) return false
    if (filters.collection && p.collection?.slug !== filters.collection) return false
    if (filters.statut && p.statut !== filters.statut) return false
    return true
  })

  // Listes de collections uniques pour le filtre
  const collections = allProduits
    .map(p => p.collection)
    .filter((c): c is Collection => c !== null)
    .reduce<Collection[]>((acc, c) => (acc.find(x => x.id === c.id) ? acc : [...acc, c]), [])

  const hasFilters = Object.values(filters).some(Boolean)

  const handleFilter = useCallback((f: FilterState) => setFilters(f), [])

  // ── Titre dynamique ──
  let titre = 'Ma Boutique'
  if (filters.genre) titre += ` — ${filters.genre === 'HOMME' ? 'Homme' : filters.genre === 'FEMME' ? 'Femme' : 'Unisexe'}`
  if (filters.collection) {
    const col = collections.find(c => c.slug === filters.collection)
    if (col) titre += ` — ${col.nom}`
  }

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-end-black tracking-tight">{titre}</h1>
          {!loading && (
            <p className="text-sm text-end-gray-mid mt-1">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
              {hasFilters && <button onClick={() => setFilters({ genre: '', categorie: '', collection: '', statut: '' })} className="ml-2 underline underline-offset-2 hover:text-end-black transition-colors">Effacer les filtres</button>}
            </p>
          )}
        </div>

        {/* Bouton filtre mobile */}
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 border border-end-gray-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-end-black hover:bg-end-gray-light transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filtrer
          {hasFilters && <span className="w-4 h-4 bg-end-black text-end-white text-2xs rounded-full flex items-center justify-center leading-none">
            {Object.values(filters).filter(Boolean).length}
          </span>}
        </button>
      </div>

      {/* Filtres actifs (pills) */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.genre && (
            <button onClick={() => setFilters(f => ({ ...f, genre: '' }))}
              className="flex items-center gap-1.5 bg-end-black text-end-white text-xs px-3 py-1 font-semibold uppercase tracking-wider">
              {filters.genre === 'HOMME' ? 'Homme' : filters.genre === 'FEMME' ? 'Femme' : 'Unisexe'}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
          {filters.categorie && (
            <button onClick={() => setFilters(f => ({ ...f, categorie: '' }))}
              className="flex items-center gap-1.5 bg-end-black text-end-white text-xs px-3 py-1 font-semibold uppercase tracking-wider">
              {CATEGORIE_LABEL[filters.categorie] ?? filters.categorie}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
          {filters.collection && (
            <button onClick={() => setFilters(f => ({ ...f, collection: '' }))}
              className="flex items-center gap-1.5 bg-end-black text-end-white text-xs px-3 py-1 font-semibold uppercase tracking-wider">
              {collections.find(c => c.slug === filters.collection)?.nom ?? filters.collection}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
          {filters.statut && (
            <button onClick={() => setFilters(f => ({ ...f, statut: '' }))}
              className="flex items-center gap-1.5 bg-end-black text-end-white text-xs px-3 py-1 font-semibold uppercase tracking-wider">
              {STATUT_LABEL[filters.statut] ?? filters.statut}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* ── Grille produits ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-end-gray-light" />
                  <div className="mt-2 h-3 bg-end-gray-light rounded w-1/2" />
                  <div className="mt-1 h-4 bg-end-gray-light rounded w-3/4" />
                  <div className="mt-1 h-3 bg-end-gray-light rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-30">
                <rect x="6" y="8" width="36" height="32" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 22h16M16 30h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-end-black font-semibold">Aucun produit trouvé</p>
              <p className="text-sm text-end-gray-mid mt-1">Essayez de modifier vos filtres</p>
              <button onClick={() => setFilters({ genre: '', categorie: '', collection: '', statut: '' })}
                className="mt-4 underline text-sm text-end-black hover:opacity-60 transition-opacity">
                Voir tous les articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filtered.map(p => <ProductCard key={p.id} produit={p} />)}
            </div>
          )}
        </div>

        {/* ── Sidebar filtres (desktop) ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-28">
          <FilterPanel
            filters={filters}
            onChange={handleFilter}
            collections={collections}
            total={filtered.length}
          />
        </aside>
      </div>

      {/* ── Drawer filtres mobile ── */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white z-50 flex flex-col shadow-2xl lg:hidden">
            <div className="flex items-center justify-between p-5 border-b border-end-gray-border">
              <h2 className="font-bold text-sm uppercase tracking-widest text-end-black">Filtres</h2>
              <button onClick={() => setFilterOpen(false)} className="text-end-black hover:opacity-60 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel
                filters={filters}
                onChange={f => { handleFilter(f); setFilterOpen(false) }}
                collections={collections}
                total={filtered.length}
                onClose={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </main>
  )
}
