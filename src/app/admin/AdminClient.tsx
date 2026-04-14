'use client'

/**
 * @fichier app/admin/AdminClient.tsx
 * @rôle Interface d'administration WOG-STYLE.
 *       - Analytics : visites par jour/semaine/mois, courbe achats
 *       - Carte flux géographique (mockée SVG)
 *       - CRUD produits : liste, édition, ajout
 *       - Gestion collections
 */

import React, { useState } from 'react'
import Link from 'next/link'
import productsData from '@/data/products.json'
import type { Product } from '@/types'

/* ============================================================
 * DONNÉES MOCKÉES POUR LES GRAPHES
 * ============================================================ */

const VISITS_DATA = {
  jour: [120, 145, 98, 210, 187, 230, 195],
  semaine: [870, 1020, 940, 1150, 1380, 1210, 1090],
  mois: [4200, 5100, 4800, 6200, 5800, 7100, 6500, 7400, 6800, 8100, 7600, 9200],
}

const ACHATS_DATA = {
  jour: [8, 12, 6, 18, 15, 22, 17],
  semaine: [62, 78, 71, 89, 95, 82, 73],
  mois: [280, 310, 295, 380, 350, 420, 390, 445, 410, 490, 460, 550],
}

const LABELS = {
  jour: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  semaine: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'],
  mois: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
}

const GEO_DATA = [
  { ville: 'Dakar', achats: 245, lat: 14.7167, lng: -17.4677 },
  { ville: 'Abidjan', achats: 178, lat: 5.3599, lng: -4.0083 },
  { ville: 'Paris', achats: 134, lat: 48.8566, lng: 2.3522 },
  { ville: 'Bamako', achats: 87, lat: 12.6392, lng: -8.0029 },
  { ville: 'Lomé', achats: 65, lat: 6.1375, lng: 1.2123 },
  { ville: 'Cotonou', achats: 54, lat: 6.3654, lng: 2.4183 },
  { ville: 'Bruxelles', achats: 43, lat: 50.8503, lng: 4.3517 },
]

type PeriodeType = 'jour' | 'semaine' | 'mois'
type AdminTab = 'analytics' | 'produits' | 'collections'

/* ============================================================
 * MINI GRAPHE EN BARRES (SVG natif)
 * ============================================================ */
const BarChart: React.FC<{
  data: number[]
  labels: string[]
  couleur: string
  label: string
}> = ({ data, labels, couleur, label }) => {
  const max = Math.max(...data)
  const height = 120
  const barW = Math.floor(220 / data.length) - 2

  return (
    <div>
      <p className="text-xs text-end-gray-mid uppercase tracking-wider mb-3">{label}</p>
      <svg width="100%" viewBox={`0 0 ${data.length * (barW + 2)} ${height + 24}`} className="overflow-visible">
        {data.map((val, i) => {
          const barH = Math.max(4, (val / max) * height)
          const x = i * (barW + 2)
          const y = height - barH
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={couleur}
                opacity={0.85}
                rx={1}
              />
              <text
                x={x + barW / 2}
                y={height + 14}
                textAnchor="middle"
                fontSize="7"
                fill="#9b9b9b"
              >
                {labels[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ============================================================
 * CARTE GÉO SIMPLIFIÉE (SVG Afrique de l'Ouest)
 * ============================================================ */
const GeoMap: React.FC = () => {
  const maxAchats = Math.max(...GEO_DATA.map((d) => d.achats))

  /* Projection mercator simplifiée pour la zone Afrique de l'Ouest + Europe */
  const project = (lat: number, lng: number) => {
    const x = ((lng + 20) / 60) * 400
    const y = ((55 - lat) / 55) * 260
    return { x, y }
  }

  return (
    <div>
      <p className="text-xs text-end-gray-mid uppercase tracking-wider mb-3">Flux géographique des achats</p>
      <div className="relative bg-end-gray-light rounded overflow-hidden" style={{ height: '260px' }}>
        <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet">
          {/* Fond carte simulé */}
          <rect width="400" height="260" fill="#f5f5f5" />

          {/* Océan */}
          <rect width="400" height="260" fill="#e8f4fd" opacity="0.4" />

          {/* Points géo */}
          {GEO_DATA.map((loc) => {
            const { x, y } = project(loc.lat, loc.lng)
            const r = 4 + (loc.achats / maxAchats) * 18
            return (
              <g key={loc.ville}>
                <circle cx={x} cy={y} r={r} fill="#000" opacity={0.15} />
                <circle cx={x} cy={y} r={r * 0.6} fill="#000" opacity={0.7} />
                <text x={x} y={y - r - 3} textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">
                  {loc.ville}
                </text>
                <text x={x} y={y - r - 12} textAnchor="middle" fontSize="6" fill="#666">
                  {loc.achats} ventes
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-3 mt-3">
        {GEO_DATA.map((loc) => (
          <div key={loc.ville} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-end-black" />
            <span className="text-xs text-end-gray-dark">
              {loc.ville} <span className="font-bold">{loc.achats}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */
export const AdminClient: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')
  const [periode, setPeriode] = useState<PeriodeType>('jour')
  const [produits, setProduits] = useState<Product[]>(productsData as Product[])
  const [editProduit, setEditProduit] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  /* Stats KPI */
  const totalVisites = VISITS_DATA.jour.reduce((a, b) => a + b, 0)
  const totalAchats = ACHATS_DATA.jour.reduce((a, b) => a + b, 0)
  const revenuJour = totalAchats * 42000
  const tauxConversion = ((totalAchats / totalVisites) * 100).toFixed(1)

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'produits', label: 'Produits' },
    { id: 'collections', label: 'Collections' },
  ]

  return (
    <div className="min-h-screen bg-end-gray-light">

      {/* ===== SIDEBAR + CONTENU ===== */}
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-end-black text-end-white flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logo.jpg" alt="WOG-STYLE" className="w-8 h-8 object-contain rounded" />
              <span className="text-xs font-black uppercase tracking-wider">WOG Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3 px-2">Menu</p>
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded mb-1 transition-colors ${
                  activeTab === t.id
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Lien retour site */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Voir le site
            </Link>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 p-8 overflow-auto">

          {/* ===================== ANALYTICS ===================== */}
          {activeTab === 'analytics' && (
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-end-black mb-8">
                Analytics
              </h1>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Visites (7j)', value: totalVisites.toLocaleString('fr-FR'), delta: '+12%' },
                  { label: 'Commandes (7j)', value: totalAchats.toLocaleString('fr-FR'), delta: '+8%' },
                  { label: 'Revenu (7j)', value: (revenuJour).toLocaleString('fr-FR') + ' XOF', delta: '+15%' },
                  { label: 'Taux conversion', value: tauxConversion + '%', delta: '+0.3%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-end-white p-5">
                    <p className="text-xs text-end-gray-mid uppercase tracking-wider mb-2">{kpi.label}</p>
                    <p className="text-2xl font-black text-end-black mb-1">{kpi.value}</p>
                    <p className="text-xs font-semibold text-green-600">{kpi.delta} vs période préc.</p>
                  </div>
                ))}
              </div>

              {/* Sélecteur période */}
              <div className="flex items-center gap-0 border border-end-gray-border mb-6 w-fit">
                {(['jour', 'semaine', 'mois'] as PeriodeType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriode(p)}
                    className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors capitalize ${
                      periode === p
                        ? 'bg-end-black text-end-white'
                        : 'text-end-black hover:bg-end-gray-light'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Graphes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-end-white p-6">
                  <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-4">
                    Visites
                  </h2>
                  <BarChart
                    data={VISITS_DATA[periode]}
                    labels={LABELS[periode]}
                    couleur="#000000"
                    label={`Visites par ${periode}`}
                  />
                </div>
                <div className="bg-end-white p-6">
                  <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-4">
                    Achats
                  </h2>
                  <BarChart
                    data={ACHATS_DATA[periode]}
                    labels={LABELS[periode]}
                    couleur="#4B5563"
                    label={`Commandes par ${periode}`}
                  />
                </div>
              </div>

              {/* Carte géographique */}
              <div className="bg-end-white p-6">
                <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-4">
                  Flux géographique
                </h2>
                <GeoMap />
              </div>
            </div>
          )}

          {/* ===================== PRODUITS ===================== */}
          {activeTab === 'produits' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black uppercase tracking-tight text-end-black">
                  Produits ({produits.length})
                </h1>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 bg-end-black text-end-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                >
                  + Ajouter un produit
                </button>
              </div>

              {/* Tableau produits */}
              <div className="bg-end-white overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="border-b border-end-gray-border">
                    <tr>
                      {['Image', 'Nom', 'Genre', 'Prix (XOF)', 'Statut', 'Stock', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-xs font-bold uppercase tracking-wider text-end-gray-mid px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-end-gray-border">
                    {produits.map((p) => (
                      <tr key={p.id} className="hover:bg-end-gray-light transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-12 overflow-hidden bg-end-gray-light">
                            <img
                              src={p.images?.[0] ?? p.mainImage.src}
                              alt={p.name}
                              className="w-full h-full object-contain object-center"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-end-black max-w-xs leading-tight">{p.name}</p>
                          <p className="text-xs text-end-gray-mid">{p.brand}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold uppercase text-end-gray-dark">{p.genre}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold">{p.price.toLocaleString('fr-FR')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-bold uppercase px-2 py-0.5 rounded-sm ${
                            p.status === 'new' ? 'bg-blue-100 text-blue-700' :
                            p.status === 'exclusive' ? 'bg-purple-100 text-purple-700' :
                            p.status === 'sale' ? 'bg-red-100 text-red-700' :
                            'bg-end-gray-light text-end-gray-mid'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-end-gray-mid">{p.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditProduit(p)}
                              className="text-xs font-semibold text-end-black underline hover:opacity-60 transition-opacity"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => setProduits((prev) => prev.filter((x) => x.id !== p.id))}
                              className="text-xs font-semibold text-end-red underline hover:opacity-60 transition-opacity"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal édition produit */}
              {editProduit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditProduit(null)}>
                  <div
                    className="bg-end-white w-full max-w-lg max-h-[80vh] overflow-y-auto p-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-black uppercase tracking-tight">Modifier le produit</h2>
                      <button type="button" onClick={() => setEditProduit(null)} className="text-end-gray-mid hover:text-end-black">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); setEditProduit(null) }} className="space-y-4">
                      {[
                        { label: 'Nom', key: 'name', type: 'text' },
                        { label: 'Marque', key: 'brand', type: 'text' },
                        { label: 'Prix (XOF)', key: 'price', type: 'number' },
                        { label: 'Stock', key: 'stock', type: 'number' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            defaultValue={String(editProduit[field.key as keyof Product] ?? '')}
                            className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                          />
                        </div>
                      ))}

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                          Genre
                        </label>
                        <select
                          defaultValue={editProduit.genre}
                          className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                        >
                          {['HOMME', 'FEMME', 'UNISEXE'].map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                          Statut
                        </label>
                        <select
                          defaultValue={editProduit.status}
                          className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                        >
                          {['new', 'exclusive', 'sale', 'standard'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-end-black text-end-white py-3 text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditProduit(null)}
                          className="flex-1 border border-end-gray-border py-3 text-xs font-bold uppercase tracking-wider hover:bg-end-gray-light transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== COLLECTIONS ===================== */}
          {activeTab === 'collections' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black uppercase tracking-tight text-end-black">
                  Collections
                </h1>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-end-black text-end-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                >
                  + Nouvelle collection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  {
                    nom: 'GENÈSE',
                    slug: 'genese',
                    image: '/images/genese/emeraude-royale-1.jpg',
                    pieces: 9,
                    statut: 'Active',
                    date: 'Jan 2024',
                  },
                  {
                    nom: 'WOG HOMME',
                    slug: 'homme',
                    image: '/images/front-1.jpg',
                    pieces: (productsData as Product[]).filter((p) => p.genre?.toUpperCase() === 'HOMME').length,
                    statut: 'Active',
                    date: 'Jan 2024',
                  },
                  {
                    nom: 'WOG FEMME',
                    slug: 'femme',
                    image: '/images/front-2.jpg',
                    pieces: (productsData as Product[]).filter((p) => p.genre?.toUpperCase() === 'FEMME').length,
                    statut: 'Active',
                    date: 'Jan 2024',
                  },
                  {
                    nom: 'WOG ÉDITORIAL',
                    slug: 'editorial',
                    image: '/images/editorial-1.jpg',
                    pieces: (productsData as Product[]).filter((p) => p.status === 'exclusive').length,
                    statut: 'Active',
                    date: 'Fév 2024',
                  },
                ].map((col) => (
                  <div key={col.slug} className="bg-end-white overflow-hidden">
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ height: '200px' }}>
                      <img
                        src={col.image}
                        alt={col.nom}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <span className="absolute top-3 right-3 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5">
                        {col.statut}
                      </span>
                    </div>

                    {/* Infos */}
                    <div className="p-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-end-black mb-1">
                        {col.nom}
                      </h3>
                      <p className="text-xs text-end-gray-mid mb-4">
                        {col.pieces} pièces — Créée {col.date}
                      </p>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/collection/${col.slug}`}
                          target="_blank"
                          className="text-xs font-semibold text-end-black underline hover:opacity-60 transition-opacity"
                        >
                          Voir
                        </Link>
                        <button type="button" className="text-xs font-semibold text-end-black underline hover:opacity-60 transition-opacity">
                          Modifier
                        </button>
                        <button type="button" className="text-xs font-semibold text-end-red underline hover:opacity-60 transition-opacity">
                          Archiver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminClient
