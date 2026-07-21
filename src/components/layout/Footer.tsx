/**
 * @fichier components/layout/Footer.tsx
 * @rôle Pied de page complet de l'application END. Clothing Clone.
 *        Quatre colonnes de liens (Help, Information, Connect, Newsletter),
 *        champ d'inscription newsletter, logos réseaux sociaux, copyright et paiement.
 * @dépendances react, next/link
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'

/* ============================================================
 * DONNÉES DES COLONNES DE LIENS
 * ============================================================ */

/** Liens de la colonne "Help" */
const HELP_LINKS = [
  { label: 'FAQ', href: '/help/faq' },
  { label: 'Suivi de commande', href: '/help/track-order' },
  { label: 'Livraison', href: '/help/delivery' },
  { label: 'Retours', href: '/help/returns' },
  { label: 'Guide des tailles', href: '/help/size-guide' },
  { label: 'Contact', href: '/help/contact' },
  { label: 'Authenticité', href: '/help/authenticity' },
]

/** Liens de la colonne "Information" */
const INFO_LINKS = [
  { label: 'À propos de WOG-STYLE', href: '/about' },
  { label: 'Carrières', href: '/careers' },
  { label: 'Presse', href: '/press' },
  { label: 'Confidentialité', href: '/privacy' },
  { label: 'Conditions d\'utilisation', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Accessibilité', href: '/accessibility' },
]

/** Liens réseaux sociaux de la colonne "Connect" */
const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/wogstyle', icon: 'instagram' },
  { label: 'Twitter / X', href: 'https://twitter.com/wogstyle', icon: 'twitter' },
  { label: 'Facebook', href: 'https://facebook.com/wogstyle', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com/wogstyle', icon: 'youtube' },
  { label: 'Pinterest', href: 'https://pinterest.com/wogstyle', icon: 'pinterest' },
]

/* ============================================================
 * ICÔNES RÉSEAUX SOCIAUX
 * SVG inline natifs pour éviter les dépendances de librairies d'icônes
 * ============================================================ */

/**
 * Retourne l'icône SVG d'un réseau social selon son nom.
 *
 * @param iconName - Nom du réseau social ('instagram' | 'twitter' | etc.)
 * @returns Élément SVG React
 */
const SocialIcon: React.FC<{ name: string }> = ({ name }) => {
  const svgProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 18 18',
    fill: 'currentColor',
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'instagram':
      return (
        <svg {...svgProps}>
          <rect x="2" y="2" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="13" cy="5" r="0.8" fill="currentColor" />
        </svg>
      )
    case 'twitter':
      return (
        <svg {...svgProps}>
          <path d="M2 3h3l3.5 5L13 3h3L11 9.5 16 15h-3l-4-5.5L4 15H1l5.5-6L2 3Z" strokeWidth="0" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...svgProps}>
          <path d="M15 1H3a2 2 0 00-2 2v12a2 2 0 002 2h6v-6H7V8h2V6.5C9 4.6 10.1 3 12 3h2v3h-1c-.6 0-1 .4-1 1v1h2l-.5 3H12v6h3a2 2 0 002-2V3a2 2 0 00-2-2z" strokeWidth="0" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...svgProps}>
          <rect x="1" y="4" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M7 7l5 2-5 2V7Z" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg {...svgProps}>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )
  }
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

/**
 * Footer — pied de page de l'application END. Clothing.
 *
 * Structure :
 * 1. Bande newsletter
 * 2. Colonnes de liens (Help, Information, Connect, Newsletter)
 * 3. Barre inférieure (copyright + logos paiement + liens légaux)
 *
 * @returns Élément JSX du footer complet
 */
export const Footer: React.FC = () => {
  /* État du champ newsletter */
  const [email, setEmail] = useState<string>('')

  /* État de soumission du formulaire newsletter */
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  /**
   * Gère la soumission du formulaire d'inscription newsletter.
   * Dans cette version clone, simule une soumission réussie après 1 seconde.
   *
   * @param e - Événement de soumission du formulaire
   */
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setNewsletterStatus('loading')

    /* Simulation d'une requête API avec délai artificiel */
    setTimeout(() => {
      setNewsletterStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <footer className="bg-end-black text-end-white mt-16">

      {/* === SECTION PRINCIPALE DU FOOTER ===
          Grille de 4 colonnes sur desktop */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* === COLONNE HELP ===
              Liens d'aide et support client */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-end-white">
              Aide
            </h3>
            <ul className="space-y-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-end-white/60 hover:text-end-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === COLONNE INFORMATION ===
              Liens institutionnels et légaux */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-end-white">
              Information
            </h3>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-end-white/60 hover:text-end-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* === COLONNE CONNECT ===
              Liens réseaux sociaux avec icônes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-end-white">
              Nous suivre
            </h3>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-end-white/60 hover:text-end-white transition-colors"
                  >
                    {/* Icône SVG du réseau social */}
                    <SocialIcon name={link.icon} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* === COLONNE NEWSLETTER ===
              Formulaire d'inscription à la newsletter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-end-white">
              Newsletter
            </h3>
            <p className="text-sm text-end-white/60 mb-4 leading-relaxed">
              Inscrivez-vous pour recevoir les dernières nouveautés, les lancements
              exclusifs et les offres spéciales WOG-STYLE.
            </p>

            {newsletterStatus === 'success' ? (
              /* Message de confirmation après inscription */
              <p className="text-sm text-end-white font-medium">
                Merci ! Vous êtes maintenant inscrit(e) à notre newsletter.
              </p>
            ) : (
              /* Formulaire d'inscription */
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <div className="flex gap-0">
                  {/* Champ email */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                    className="flex-1 bg-end-white/10 text-end-white placeholder:text-end-white/40 text-sm px-3 py-2.5 border border-end-white/20 focus:outline-none focus:border-end-white/60 transition-colors"
                  />
                  {/* Bouton d'envoi */}
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="bg-end-white text-end-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-end-gray-light transition-colors disabled:opacity-50"
                  >
                    {newsletterStatus === 'loading' ? '...' : 'OK'}
                  </button>
                </div>
                {/* Mention RGPD */}
                <p className="text-xs text-end-white/30 leading-relaxed">
                  En vous inscrivant, vous acceptez nos{' '}
                  <Link href="/privacy" className="underline hover:text-end-white/60">
                    conditions de confidentialité
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* === BARRE INFÉRIEURE DU FOOTER ===
          Copyright + logos paiement + liens légaux */}
      <div className="border-t border-end-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Copyright + localisation */}
            <div className="flex flex-col sm:flex-row items-center gap-2 order-2 sm:order-1 text-center sm:text-left">
              <p className="text-xs text-end-white/40">
                © {new Date().getFullYear()} WOG-STYLE. Tous droits réservés.
              </p>
              <p className="text-xs text-end-white/40 uppercase tracking-[0.12em]">
                ABIDJAN | CÔTE D'IVOIRE
              </p>
            </div>

            {/* Logos des moyens de paiement (SVG simplifiés) */}
            <div className="flex items-center gap-3 order-1 sm:order-2">
              {/* Visa */}
              <div className="w-10 h-6 bg-end-white/10 flex items-center justify-center rounded">
                <span className="text-2xs text-end-white/60 font-bold">VISA</span>
              </div>
              {/* Mastercard */}
              <div className="w-10 h-6 bg-end-white/10 flex items-center justify-center rounded">
                <span className="text-2xs text-end-white/60 font-bold">MC</span>
              </div>
              {/* PayPal */}
              <div className="w-10 h-6 bg-end-white/10 flex items-center justify-center rounded">
                <span className="text-2xs text-end-white/60 font-bold">PP</span>
              </div>
              {/* American Express */}
              <div className="w-10 h-6 bg-end-white/10 flex items-center justify-center rounded">
                <span className="text-2xs text-end-white/60 font-bold">AMEX</span>
              </div>
              {/* Apple Pay */}
              <div className="w-10 h-6 bg-end-white/10 flex items-center justify-center rounded">
                <span className="text-2xs text-end-white/60 font-bold">⌘Pay</span>
              </div>
            </div>

            {/* Liens légaux */}
            <div className="flex items-center gap-4 order-3">
              <Link
                href="/privacy"
                className="text-xs text-end-white/40 hover:text-end-white/70 transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="/cookies"
                className="text-xs text-end-white/40 hover:text-end-white/70 transition-colors"
              >
                Cookies
              </Link>
              <Link
                href="/terms"
                className="text-xs text-end-white/40 hover:text-end-white/70 transition-colors"
              >
                CGU
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
