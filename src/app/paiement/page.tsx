/**
 * @fichier app/paiement/page.tsx
 * @rôle Page de paiement WOG-STYLE.
 *       Supporte : carte bancaire + Mobile Money (Wave, Orange Money, MTN Money).
 */

import type { Metadata } from 'next'
import { PaiementClient } from './PaiementClient'

export const metadata: Metadata = {
  title: 'Paiement | WOG-STYLE',
  description: 'Finalisez votre commande WOG-STYLE. Paiement sécurisé par carte bancaire ou Mobile Money.',
}

export default function PaiementPage() {
  return <PaiementClient />
}
