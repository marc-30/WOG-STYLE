/**
 * @fichier app/profil/page.tsx
 * @rôle Page profil utilisateur connecté.
 */

import type { Metadata } from 'next'
import { ProfilClient } from './ProfilClient'

export const metadata: Metadata = {
  title: 'Mon profil | WOG-STYLE',
}

export default function ProfilPage() {
  return <ProfilClient />
}
