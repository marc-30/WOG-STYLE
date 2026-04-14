/**
 * @fichier app/contact/page.tsx
 * @rôle Page de contact WOG-STYLE.
 *       Formulaire de contact + informations.
 */

import type { Metadata } from 'next'
import { ContactClient } from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact | WOG-STYLE',
  description: "Contactez l'équipe WOG-STYLE — questions, commandes, collaborations.",
}

export default function ContactPage() {
  return <ContactClient />
}
