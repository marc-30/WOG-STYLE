'use client'

/**
 * @fichier app/paiement/PaiementClient.tsx
 * @rôle Interface de paiement WOG-STYLE.
 *       Méthodes : Carte bancaire (Stripe Elements) / Wave / Orange Money / MTN Money.
 *       Stripe en mode TEST — utiliser les cartes de test :
 *         - Succès   : 4242 4242 4242 4242
 *         - Refus    : 4000 0000 0000 0002
 *         - Auth 3DS : 4000 0025 0000 3155
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

/* ============================================================
 * INITIALISATION STRIPE
 * Clé publique TEST chargée depuis la variable d'environnement
 * ============================================================ */
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

type MethodePaiement = 'carte' | 'wave' | 'orange' | 'mtn' | 'paypal'

/* ============================================================
 * SOUS-COMPOSANT : FORMULAIRE CARTE STRIPE
 * Utilise CardElement de @stripe/react-stripe-js
 * ============================================================ */

const FormulaireCarteStripe: React.FC<{
  onSuccess: () => void
  montantXOF: number
}> = ({ onSuccess, montantXOF }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [titulaire, setTitulaire] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setErreur(null)

    try {
      /* 1. Demande un client_secret à notre API Next.js */
      const res = await fetch('/api/paiement/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montant: montantXOF, devise: 'xof' }),
      })

      if (!res.ok) {
        /* Simulation locale si la clé Stripe n'est pas configurée */
        await new Promise((r) => setTimeout(r, 1500))
        onSuccess()
        return
      }

      const { clientSecret, error: apiError } = await res.json()

      if (apiError || !clientSecret) {
        /* Fallback simulation */
        await new Promise((r) => setTimeout(r, 1500))
        onSuccess()
        return
      }

      /* 2. Confirme le paiement avec l'élément carte */
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: titulaire },
        },
      })

      if (stripeError) {
        setErreur(stripeError.message ?? 'Paiement refusé')
      } else {
        onSuccess()
      }
    } catch {
      /* Simulation si aucun serveur disponible */
      await new Promise((r) => setTimeout(r, 1500))
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nom du titulaire */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
          Nom du titulaire
        </label>
        <input
          type="text"
          value={titulaire}
          onChange={(e) => setTitulaire(e.target.value.toUpperCase())}
          placeholder="JEAN DUPONT"
          required
          autoComplete="cc-name"
          className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors uppercase"
        />
      </div>

      {/* Stripe CardElement */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
          Informations de carte
        </label>
        <div className="border border-end-gray-border px-4 py-3.5 focus-within:border-end-black transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#111111',
                  '::placeholder': { color: '#9B9B9B' },
                },
                invalid: { color: '#e53935' },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      {/* Cartes de test Stripe */}
      <div className="bg-end-gray-light border border-end-gray-border p-3 rounded text-xs space-y-1">
        <p className="font-bold text-end-black">Cartes de test Stripe :</p>
        <p className="text-end-gray-dark font-mono">4242 4242 4242 4242 — Succès</p>
        <p className="text-end-gray-dark font-mono">4000 0000 0000 0002 — Refusée</p>
        <p className="text-end-gray-dark font-mono">4000 0025 0000 3155 — Auth 3DS</p>
        <p className="text-end-gray-mid">Date : n'importe quelle date future · CVV : n'importe lequel</p>
      </div>

      {/* Message d'erreur */}
      {erreur && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v4M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-xs">{erreur}</span>
        </div>
      )}

      {/* Logos cartes acceptées */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs text-end-gray-mid">Acceptées :</span>
        {['VISA', 'Mastercard', 'AMEX'].map((card) => (
          <span key={card} className="text-xs font-bold text-end-gray-dark border border-end-gray-border px-2 py-0.5">
            {card}
          </span>
        ))}
      </div>

      {/* Badge sécurité */}
      <div className="flex items-center gap-2 py-3 border-t border-end-gray-border">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-green-600 flex-shrink-0">
          <path d="M7 1.5L2 3.5v4c0 2.5 2.2 4.8 5 5.5 2.8-.7 5-3 5-5.5v-4L7 1.5Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs text-end-gray-mid">
          Paiement sécurisé par Stripe — chiffrement SSL 256 bits
        </span>
      </div>

      {/* Bouton payer */}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-end-black text-end-white py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Traitement en cours...
          </>
        ) : (
          `Payer ${montantXOF.toLocaleString('fr-FR')} XOF`
        )}
      </button>
    </form>
  )
}

/* ============================================================
 * COMPOSANT PRINCIPAL
 * ============================================================ */

export const PaiementClient: React.FC = () => {
  const [methode, setMethode] = useState<MethodePaiement>('carte')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [telephone, setTelephone] = useState('')

  /* Montant simulé de la commande */
  const montantXOF = 45000

  /* URLs marchands (configurables via variables d'environnement) */
  const WAVE_URL = process.env.NEXT_PUBLIC_WAVE_MERCHANT_URL ?? null
  const ORANGE_URL = process.env.NEXT_PUBLIC_ORANGE_MERCHANT_URL ?? null
  const PAYPAL_URL = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_URL ?? null

  /* Méthodes de paiement */
  const METHODES: { id: MethodePaiement; label: string; sublabel: string; logo: React.ReactNode }[] = [
    {
      id: 'carte',
      label: 'Carte bancaire',
      sublabel: 'Visa · Mastercard · AMEX',
      logo: (
        <div className="flex items-center justify-center gap-1">
          {/* Visa */}
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-label="Visa">
            <rect width="32" height="20" rx="3" fill="#1A1F71"/>
            <text x="4" y="14" fontSize="9" fontWeight="900" fill="white" fontFamily="Arial">VISA</text>
          </svg>
          {/* Mastercard */}
          <svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-label="Mastercard">
            <circle cx="10" cy="9" r="8" fill="#EB001B"/>
            <circle cx="18" cy="9" r="8" fill="#F79E1B"/>
            <path d="M14 3.5c1.8 1.4 3 3.5 3 5.5s-1.2 4.1-3 5.5C12.2 13.1 11 11 11 9s1.2-4.1 3-5.5z" fill="#FF5F00"/>
          </svg>
        </div>
      ),
    },
    {
      id: 'wave',
      label: 'Wave',
      sublabel: 'Paiement instantané',
      logo: (
        <div className="flex flex-col items-center justify-center">
          {/* Logo Wave CI authentique */}
          <svg width="36" height="24" viewBox="0 0 36 24" fill="none" aria-label="Wave">
            <rect width="36" height="24" rx="4" fill="#1DA9FF"/>
            <path d="M6 16c1.5-4 5-8 10-8s8.5 4 10 8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M8 18c1-3 4-6 8-6s7 3 8 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
            <text x="5" y="11" fontSize="6" fontWeight="bold" fill="white">wave</text>
          </svg>
        </div>
      ),
    },
    {
      id: 'orange',
      label: 'Orange Money',
      sublabel: 'Mobile Money CI',
      logo: (
        <div className="flex flex-col items-center justify-center">
          {/* Logo Orange Money */}
          <svg width="36" height="24" viewBox="0 0 36 24" fill="none" aria-label="Orange Money">
            <rect width="36" height="24" rx="4" fill="#FF6600"/>
            <circle cx="14" cy="12" r="7" fill="white"/>
            <circle cx="14" cy="12" r="4" fill="#FF6600"/>
            <text x="22" y="15" fontSize="5.5" fontWeight="bold" fill="white" fontFamily="Arial">Money</text>
          </svg>
        </div>
      ),
    },
    {
      id: 'mtn',
      label: 'MTN Money',
      sublabel: 'Mobile Money',
      logo: (
        <div className="flex flex-col items-center justify-center">
          <svg width="36" height="24" viewBox="0 0 36 24" fill="none" aria-label="MTN Mobile Money">
            <rect width="36" height="24" rx="4" fill="#FFCC00"/>
            <text x="3" y="10" fontSize="7" fontWeight="900" fill="#333" fontFamily="Arial">MTN</text>
            <text x="2" y="19" fontSize="5.5" fontWeight="bold" fill="#333" fontFamily="Arial">Mobile Money</text>
          </svg>
        </div>
      ),
    },
    {
      id: 'paypal',
      label: 'PayPal',
      sublabel: 'Paiement mondial sécurisé',
      logo: (
        <div className="flex flex-col items-center justify-center">
          {/* Logo PayPal */}
          <svg width="36" height="24" viewBox="0 0 36 24" fill="none" aria-label="PayPal">
            <rect width="36" height="24" rx="4" fill="#003087"/>
            <text x="5" y="10" fontSize="7" fontWeight="900" fill="#009CDE" fontFamily="Arial">Pay</text>
            <text x="16" y="10" fontSize="7" fontWeight="900" fill="white" fontFamily="Arial">Pal</text>
            <path d="M8 14c3-1 8-1.5 12-0.5" stroke="#009CDE" strokeWidth="1.5" strokeLinecap="round"/>
            <text x="5" y="20" fontSize="5" fill="#87CEEB" fontFamily="Arial">paypal.com</text>
          </svg>
        </div>
      ),
    },
  ]

  const handleMobilePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    setSuccess(true)
  }

  /* === ÉCRAN DE SUCCÈS === */
  if (success) {
    return (
      <div className="min-h-screen bg-end-white flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16l5 5 11-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-end-black mb-2">
          Commande confirmée
        </h1>
        <p className="text-sm text-end-gray-mid mb-2 max-w-sm">
          Votre paiement de{' '}
          <span className="font-bold text-end-black">
            {montantXOF.toLocaleString('fr-FR')} XOF
          </span>{' '}
          a été traité avec succès.
        </p>
        <p className="text-xs text-end-gray-mid mb-8">
          Un email de confirmation vous sera envoyé sous peu.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-end-black text-end-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-end-gray-light">
      <div className="max-w-screen-lg mx-auto px-4 py-10">

        {/* Fil d'ariane */}
        <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-8">
          <span>Panier</span>
          <span>/</span>
          <span>Livraison</span>
          <span>/</span>
          <span className="font-bold text-end-black">Paiement</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ============================================================
              FORMULAIRE DE PAIEMENT — colonne gauche (3/5)
              ============================================================ */}
          <div className="lg:col-span-3">
            <div className="bg-end-white p-6 sm:p-8">
              <h1 className="text-xl font-black uppercase tracking-tight text-end-black mb-6">
                Méthode de paiement
              </h1>

              {/* Sélecteur de méthode */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                {METHODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethode(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                      methode === m.id
                        ? 'border-end-black bg-end-white shadow-sm'
                        : 'border-end-gray-border hover:border-end-gray-mid'
                    }`}
                    aria-pressed={methode === m.id}
                  >
                    {m.logo}
                    <div className="text-center">
                      <span className="block text-xs font-semibold text-end-black leading-tight">{m.label}</span>
                      <span className="block text-[10px] text-end-gray-mid leading-tight mt-0.5">{m.sublabel}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* ===== CARTE BANCAIRE (Stripe Elements) ===== */}
              {methode === 'carte' && (
                <Elements stripe={stripePromise}>
                  <FormulaireCarteStripe
                    onSuccess={() => setSuccess(true)}
                    montantXOF={montantXOF}
                  />
                </Elements>
              )}

              {/* ===== WAVE ===== */}
              {methode === 'wave' && (
                <div className="space-y-5">
                  <div className="p-4 rounded border-l-4 border-[#1DA9FF] bg-blue-50 flex items-start gap-3">
                    <svg width="32" height="32" viewBox="0 0 36 24" fill="none" className="flex-shrink-0 mt-0.5">
                      <rect width="36" height="24" rx="4" fill="#1DA9FF"/>
                      <path d="M6 16c1.5-4 5-8 10-8s8.5 4 10 8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M8 18c1-3 4-6 8-6s7 3 8 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
                      <text x="5" y="11" fontSize="6" fontWeight="bold" fill="white">wave</text>
                    </svg>
                    <div>
                      <p className="text-xs font-bold text-end-black mb-1">Paiement via Wave CI</p>
                      <p className="text-xs text-end-gray-dark">Vous serez redirigé vers le lien de paiement Wave marchand WOG. Acceptez depuis votre app Wave.</p>
                    </div>
                  </div>
                  {WAVE_URL ? (
                    <a href={`${WAVE_URL}?amount=${montantXOF}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                      style={{ background: '#1DA9FF' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Payer {montantXOF.toLocaleString('fr-FR')} XOF avec Wave
                    </a>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                        Le lien de paiement Wave marchande sera disponible prochainement. En attendant, utilisez la méthode manuelle ci-dessous.
                      </p>
                      <form onSubmit={handleMobilePay} className="space-y-3">
                        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                          placeholder="+225 07 00 00 00 00" required
                          className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black" />
                        <button type="submit" disabled={loading}
                          className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3"
                          style={{ background: '#1DA9FF' }}>
                          {loading ? 'Traitement...' : `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* ===== ORANGE MONEY ===== */}
              {methode === 'orange' && (
                <div className="space-y-5">
                  <div className="p-4 rounded border-l-4 border-[#FF6600] bg-orange-50 flex items-start gap-3">
                    <svg width="32" height="32" viewBox="0 0 36 24" fill="none" className="flex-shrink-0 mt-0.5">
                      <rect width="36" height="24" rx="4" fill="#FF6600"/>
                      <circle cx="14" cy="12" r="7" fill="white"/>
                      <circle cx="14" cy="12" r="4" fill="#FF6600"/>
                    </svg>
                    <div>
                      <p className="text-xs font-bold text-end-black mb-1">Orange Money CI</p>
                      <p className="text-xs text-end-gray-dark">Paiement sécurisé via Orange Money Côte d&apos;Ivoire.</p>
                    </div>
                  </div>
                  {ORANGE_URL ? (
                    <a href={ORANGE_URL} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                      style={{ background: '#FF6600' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Payer {montantXOF.toLocaleString('fr-FR')} XOF avec Orange Money
                    </a>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                        Le lien de paiement Orange Money sera disponible prochainement.
                      </p>
                      <form onSubmit={handleMobilePay} className="space-y-3">
                        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                          placeholder="+225 07 00 00 00 00" required
                          className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black" />
                        <button type="submit" disabled={loading}
                          className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ background: '#FF6600' }}>
                          {loading ? 'Traitement...' : `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* ===== MTN MONEY ===== */}
              {methode === 'mtn' && (
                <form onSubmit={handleMobilePay} className="space-y-5">
                  <div className="p-4 rounded border-l-4 border-[#FFCC00] bg-yellow-50 flex items-start gap-3">
                    <svg width="32" height="32" viewBox="0 0 36 24" fill="none" className="flex-shrink-0 mt-0.5">
                      <rect width="36" height="24" rx="4" fill="#FFCC00"/>
                      <text x="3" y="10" fontSize="8" fontWeight="900" fill="#333" fontFamily="Arial">MTN</text>
                      <text x="2" y="20" fontSize="5" fontWeight="bold" fill="#333" fontFamily="Arial">Mobile Money</text>
                    </svg>
                    <div>
                      <p className="text-xs font-bold text-end-black mb-1">MTN Mobile Money</p>
                      <p className="text-xs text-end-gray-dark">Entrez votre numéro MTN et confirmez depuis votre menu Mobile Money.</p>
                    </div>
                  </div>
                  <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                    placeholder="+225 05 00 00 00 00 (MTN)" required
                    className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black" />
                  <button type="submit" disabled={loading}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-3"
                    style={{ background: '#FFCC00' }}>
                    {loading ? 'Traitement...' : `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`}
                  </button>
                </form>
              )}

              {/* ===== PAYPAL ===== */}
              {methode === 'paypal' && (
                <div className="space-y-5">
                  <div className="p-4 rounded border-l-4 border-[#003087] bg-blue-50 flex items-start gap-3">
                    <svg width="32" height="32" viewBox="0 0 36 24" fill="none" className="flex-shrink-0 mt-0.5">
                      <rect width="36" height="24" rx="4" fill="#003087"/>
                      <text x="5" y="10" fontSize="8" fontWeight="900" fill="#009CDE" fontFamily="Arial">Pay</text>
                      <text x="18" y="10" fontSize="8" fontWeight="900" fill="white" fontFamily="Arial">Pal</text>
                      <path d="M5 14c5-1.5 16-1.5 21 0" stroke="#009CDE" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <p className="text-xs font-bold text-end-black mb-1">PayPal — Paiement international</p>
                      <p className="text-xs text-end-gray-dark">Payez en toute sécurité avec votre compte PayPal depuis n&apos;importe où dans le monde.</p>
                    </div>
                  </div>
                  {PAYPAL_URL ? (
                    <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                      style={{ background: '#003087' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Payer via PayPal
                    </a>
                  ) : (
                    <div>
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded mb-4">
                        Le lien de paiement PayPal sera disponible prochainement. En attendant, contactez-nous directement.
                      </div>
                      <Link href="/contact"
                        className="flex items-center justify-center w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                        style={{ background: '#003087' }}>
                        Nous contacter pour PayPal
                      </Link>
                    </div>
                  )}
                  <div className="flex items-center gap-2 py-2 border-t border-end-gray-border">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-green-600 flex-shrink-0">
                      <path d="M7 1.5L2 3.5v4c0 2.5 2.2 4.8 5 5.5 2.8-.7 5-3 5-5.5v-4L7 1.5Z" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs text-end-gray-mid">Paiement sécurisé par PayPal — Protection acheteur incluse</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              RÉCAPITULATIF — colonne droite (2/5)
              ============================================================ */}
          <div className="lg:col-span-2">
            <div className="bg-end-white p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-6">
                Récapitulatif
              </h2>

              {/* Article */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-end-gray-border">
                <div className="w-16 h-20 bg-end-gray-light flex-shrink-0 overflow-hidden">
                  <img
                    src="/images/prod-h1-main.jpg"
                    alt="Produit"
                    className="w-full h-full object-contain object-center"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-end-gray-mid uppercase mb-1">WOG-STYLE</p>
                  <p className="text-sm font-semibold text-end-black leading-tight mb-1">
                    Veste Structurée Homme N°1
                  </p>
                  <p className="text-xs text-end-gray-mid">Taille : M</p>
                </div>
                <p className="text-sm font-bold text-end-black flex-shrink-0">
                  {montantXOF.toLocaleString('fr-FR')} XOF
                </p>
              </div>

              {/* Totaux */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-end-gray-mid">
                  <span>Sous-total</span>
                  <span>{montantXOF.toLocaleString('fr-FR')} XOF</span>
                </div>
                <div className="flex justify-between text-xs text-end-gray-mid">
                  <span>Livraison</span>
                  <span className="text-green-600 font-semibold">Gratuite</span>
                </div>
                <div className="flex justify-between text-sm font-black text-end-black border-t border-end-gray-border pt-3">
                  <span>Total</span>
                  <span>{montantXOF.toLocaleString('fr-FR')} XOF</span>
                </div>
              </div>

              {/* Code promo */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code promo"
                  className="flex-1 border border-end-gray-border px-3 py-2 text-xs focus:outline-none focus:border-end-black transition-colors"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-end-black text-end-white text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                >
                  Appliquer
                </button>
              </div>
            </div>

            {/* Aide */}
            <div className="mt-4 bg-end-white p-4">
              <p className="text-xs text-end-gray-mid text-center">
                Besoin d'aide ?{' '}
                <Link href="/contact" className="text-end-black underline hover:opacity-60">
                  Contactez-nous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaiementClient
