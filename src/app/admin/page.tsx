/**
 * @fichier app/admin/page.tsx
 * @rôle Dashboard administrateur WOG-STYLE.
 *       Analyse des visites, courbe d'achats, flux géographique,
 *       et CRUD produits/collections.
 */

import type { Metadata } from 'next'
import { AdminClient } from './AdminClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard | WOG-STYLE',
  description: 'Tableau de bord administrateur WOG-STYLE.',
}

export default function AdminPage() {
  return <AdminClient />
}
