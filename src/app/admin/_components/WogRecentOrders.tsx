'use client'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from './Table'
import Badge from './Badge'

type OrderStatus = 'Livré' | 'Expédié' | 'En attente' | 'Annulé'

interface Order {
  id: string; client: string; produit: string; montant: string; date: string; status: OrderStatus
}

const statusColor: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info'> = {
  'Livré': 'success', 'Expédié': 'info', 'En attente': 'warning', 'Annulé': 'error',
}

type Filter = 'Toutes' | 'En cours' | 'Livrées'

export default function WogRecentOrders() {
  const [orders] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('Toutes')

  const filtered = orders.filter((o) => {
    if (filter === 'En cours') return o.status === 'En attente' || o.status === 'Expédié'
    if (filter === 'Livrées') return o.status === 'Livré'
    return true
  })

  const btnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-theme-xs font-medium border transition-colors ${
      active
        ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400'
        : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
    }`

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Commandes récentes</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {filtered.length} commande{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['Toutes', 'En cours', 'Livrées'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={btnClass(filter === f)}>{f}</button>
          ))}
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              {['Commande', 'Client', 'Produit', 'Montant', 'Date', 'Statut'].map(h => (
                <TableCell key={h} isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{h}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-theme-sm text-gray-400 dark:text-gray-500" isHeader={false}>
                  <td colSpan={6} className="py-8 text-center text-theme-sm text-gray-400 dark:text-gray-500">
                    Aucune commande pour le moment.
                  </td>
                </TableCell>
              </TableRow>
            ) : filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="py-3 font-medium text-brand-600 text-theme-sm dark:text-brand-400">{order.id}</TableCell>
                <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">{order.client}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{order.produit}</TableCell>
                <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/80 font-medium">{order.montant}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{order.date}</TableCell>
                <TableCell className="py-3"><Badge size="sm" color={statusColor[order.status]}>{order.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
