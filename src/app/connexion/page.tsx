/**
 * @fichier app/connexion/page.tsx
 * @rôle Page de connexion / inscription WOG-STYLE.
 *       Authentification par email ou téléphone + mot de passe.
 *       Design minimaliste inspiré END. Clothing.
 */

import type { Metadata } from 'next'
import { ConnexionClient } from './ConnexionClient'

export const metadata: Metadata = {
  title: 'Connexion | WOG-STYLE',
  description: 'Connectez-vous à votre compte WOG-STYLE ou créez un nouveau compte.',
}

export default function ConnexionPage() {
  return <ConnexionClient />
}
