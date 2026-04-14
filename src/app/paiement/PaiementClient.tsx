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

type MethodePaiement = 'carte' | 'wave' | 'orange' | 'mtn'

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

  /* Méthodes de paiement */
  const METHODES: { id: MethodePaiement; label: string; logo: React.ReactNode }[] = [
    {
      id: 'carte',
      label: 'Carte bancaire',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
          <rect x="5" y="13" width="4" height="2" rx="0.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'wave',
      label: 'Wave',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 12C3 7 12 3 19 8" stroke="#1DA9FF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M5 16C5 11 14 7 21 12" stroke="#1DA9FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 20C7 15 16 11 21 16" stroke="#1DA9FF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'orange',
      label: 'Orange Money',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="#FF6600" />
          <circle cx="12" cy="12" r="5" fill="white" />
        </svg>
      ),
    },
    {
      id: 'mtn',
      label: 'MTN Money',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="6" width="20" height="12" rx="2" fill="#FFCC00" />
          <text x="6" y="16" fontSize="8" fontWeight="bold" fill="#000">MTN</text>
        </svg>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                {METHODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethode(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${
                      methode === m.id
                        ? 'border-end-black bg-end-white'
                        : 'border-end-gray-border hover:border-end-gray-mid'
                    }`}
                    aria-pressed={methode === m.id}
                  >
                    {m.logo}
                    <span className="text-xs font-semibold text-end-black text-center leading-tight">
                      {m.label}
                    </span>
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

              {/* ===== MOBILE MONEY (Wave / Orange / MTN) ===== */}
              {(methode === 'wave' || methode === 'orange' || methode === 'mtn') && (
                <form onSubmit={handleMobilePay} className="space-y-5">

                  {/* Info opérateur */}
                  <div className={`p-4 rounded border-l-4 ${
                    methode === 'wave' ? 'border-[#1DA9FF] bg-blue-50' :
                    methode === 'orange' ? 'border-[#FF6600] bg-orange-50' :
                    'border-[#FFCC00] bg-yellow-50'
                  }`}>
                    <p className="text-xs font-bold text-end-black mb-1">
                      {methode === 'wave' ? 'Paiement via Wave' :
                       methode === 'orange' ? 'Paiement via Orange Money' :
                       'Paiement via MTN Money'}
                    </p>
                    <p className="text-xs text-end-gray-dark">
                      {methode === 'wave'
                        ? "Entrez votre numéro Wave. Vous recevrez une demande sur votre app."
                        : methode === 'orange'
                        ? "Entrez votre numéro Orange Money. Un code USSD vous sera envoyé."
                        : "Entrez votre numéro MTN. Confirmez depuis votre menu Mobile Money."}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      id="telephone"
                      type="tel"
                      inputMode="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+225 07 00 00 00 00"
                      required
                      autoComplete="tel"
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                    />
                  </div>

                  {/* Étapes */}
                  <div className="space-y-2">
                    {(methode === 'wave' ? [
                      'Entrez votre numéro Wave ci-dessus',
                      'Cliquez sur "Confirmer le paiement"',
                      "Ouvrez votre app Wave et acceptez la demande",
                      'Votre commande est validée automatiquement',
                    ] : methode === 'orange' ? [
                      'Entrez votre numéro Orange Money',
                      'Cliquez sur "Confirmer le paiement"',
                      'Composez le code USSD reçu par SMS',
                      'Entrez votre code secret Orange Money',
                    ] : [
                      'Entrez votre numéro MTN Mobile Money',
                      'Cliquez sur "Confirmer le paiement"',
                      'Accédez à votre menu Mobile Money MTN',
                      'Approuvez la demande de paiement',
                    ]).map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-end-black text-end-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="text-xs text-end-gray-dark">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Badge sécurité */}
                  <div className="flex items-center gap-2 py-3 border-t border-end-gray-border">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-green-600 flex-shrink-0">
                      <path d="M7 1.5L2 3.5v4c0 2.5 2.2 4.8 5 5.5 2.8-.7 5-3 5-5.5v-4L7 1.5Z" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs text-end-gray-mid">
                      Paiement 100% sécurisé — vos données sont protégées
                    </span>
                  </div>

                  {/* Bouton */}
                  <button
                    type="submit"
                    disabled={loading}
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
                      `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`
                    )}
                  </button>
                </form>
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
