'use client'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from './Table'
import Badge from './Badge'

interface Product {
  id: number; nom: string; sku: string; stock: number; prix: number; ventes: number; categorie: string
}

const initialProducts: Product[] = [
  { id: 1, nom: 'Ensemble Bogolan Homme', sku: 'WOG-BOG-H01', stock: 0, prix: 45000, ventes: 0, categorie: 'GENÈSE' },
  { id: 2, nom: 'Ensemble Bogolan Femme', sku: 'WOG-BOG-F01', stock: 0, prix: 42000, ventes: 0, categorie: 'GENÈSE' },
  { id: 3, nom: 'Robe Émeraude Royale', sku: 'WOG-EMR-F01', stock: 0, prix: 55000, ventes: 0, categorie: 'GENÈSE' },
  { id: 4, nom: 'Tenue Aura Verte Homme', sku: 'WOG-AUR-H01', stock: 0, prix: 48000, ventes: 0, categorie: 'GENÈSE' },
  { id: 5, nom: 'Tenue Aura Verte Femme', sku: 'WOG-AUR-F01', stock: 0, prix: 46000, ventes: 0, categorie: 'GENÈSE' },
]

const stockBadge = (stock: number) => {
  if (stock > 20) return <span className="inline-flex items-center gap-1 text-success-600 text-theme-xs"><span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />{stock} unités</span>
  if (stock > 5)  return <span className="inline-flex items-center gap-1 text-warning-600 text-theme-xs"><span className="w-1.5 h-1.5 rounded-full bg-warning-500 inline-block" />{stock} unités</span>
  return <span className="inline-flex items-center gap-1 text-error-600 text-theme-xs"><span className="w-1.5 h-1.5 rounded-full bg-error-500 inline-block" />{stock} unités</span>
}

export default function WogProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ nom: '', sku: '', stock: '', prix: '', categorie: '' })

  const filtered = products.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.categorie.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditProduct(null); setForm({ nom: '', sku: '', stock: '', prix: '', categorie: '' }); setShowModal(true) }
  const openEdit = (p: Product) => { setEditProduct(p); setForm({ nom: p.nom, sku: p.sku, stock: String(p.stock), prix: String(p.prix), categorie: p.categorie }); setShowModal(true) }
  const handleDelete = (id: number) => { if (confirm('Supprimer ce produit ?')) setProducts(prev => prev.filter(p => p.id !== id)) }

  const handleSave = () => {
    if (!form.nom || !form.sku) return
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...form, stock: Number(form.stock), prix: Number(form.prix) } : p))
    } else {
      setProducts(prev => [...prev, { id: Date.now(), nom: form.nom, sku: form.sku, stock: Number(form.stock), prix: Number(form.prix), ventes: 0, categorie: form.categorie }])
    }
    setShowModal(false)
  }

  const fields = [
    { label: 'Nom du produit', key: 'nom', placeholder: 'Ex: Ensemble Bogolan' },
    { label: 'SKU', key: 'sku', placeholder: 'Ex: WOG-BOG-H01' },
    { label: 'Catégorie', key: 'categorie', placeholder: 'Ex: GENÈSE' },
    { label: 'Stock', key: 'stock', placeholder: '0', type: 'number' },
    { label: 'Prix (XOF)', key: 'prix', placeholder: '45000', type: 'number' },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Gestion des produits</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">{products.length} produits · CRUD complet</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-theme-xs border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400 w-44" />
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white hover:bg-brand-600 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Ajouter
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              {['Produit', 'SKU', 'Catégorie', 'Stock', 'Prix (XOF)', 'Ventes', 'Actions'].map(h => (
                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{h}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">{p.nom}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-xs font-mono dark:text-gray-400">{p.sku}</TableCell>
                <TableCell className="py-3"><Badge size="sm" color="info">{p.categorie}</Badge></TableCell>
                <TableCell className="py-3">{stockBadge(p.stock)}</TableCell>
                <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/80 font-medium">{p.prix.toLocaleString('fr-FR')}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{p.ventes}</TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="text-theme-xs text-brand-500 hover:text-brand-700 font-medium">Éditer</button>
                    <span className="text-gray-200 dark:text-gray-700">|</span>
                    <button onClick={() => handleDelete(p.id)} className="text-theme-xs text-error-500 hover:text-error-700 font-medium">Suppr.</button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
              {editProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </h4>
            <div className="space-y-3">
              {fields.map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-theme-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type={type || 'text'} placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                {editProduct ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
