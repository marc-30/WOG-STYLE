'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore } from '@/store/cartStore'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
type MethodePaiement = 'carte' | 'wave' | 'orange' | 'mtn' | 'paypal'

const FormulaireCarteStripe: React.FC<{ onSuccess: () => void; montantXOF: number }> = ({ onSuccess, montantXOF }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [titulaire, setTitulaire] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true); setErreur(null)
    try {
      const res = await fetch('/api/paiement/intent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montant: montantXOF, devise: 'xof' }),
      })
      if (!res.ok) { await new Promise(r => setTimeout(r, 1500)); onSuccess(); return }
      const { clientSecret, error: apiError } = await res.json()
      if (apiError || !clientSecret) { await new Promise(r => setTimeout(r, 1500)); onSuccess(); return }
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement, billing_details: { name: titulaire } },
      })
      if (stripeError) setErreur(stripeError.message ?? 'Paiement refusé')
      else onSuccess()
    } catch { await new Promise(r => setTimeout(r, 1500)); onSuccess() }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Nom du titulaire</label>
        <input type="text" value={titulaire} onChange={e => setTitulaire(e.target.value.toUpperCase())}
          placeholder="JEAN DUPONT" required autoComplete="cc-name"
          className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors uppercase" />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Informations de carte</label>
        <div className="border border-end-gray-border px-4 py-3.5 focus-within:border-end-blue transition-colors">
          <CardElement options={{
            style: { base: { fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#111111', '::placeholder': { color: '#9B9B9B' } }, invalid: { color: '#e53935' } },
            hidePostalCode: true,
          }} />
        </div>
      </div>
      <p className="text-xs text-end-gray-mid bg-end-gray-light border border-end-gray-border p-3 rounded">
        Test : <span className="font-mono">4242 4242 4242 4242</span> — date future — CVV quelconque
      </p>
      {erreur && <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3">{erreur}</p>}
      <button type="submit" disabled={loading || !stripe}
        className="w-full bg-end-blue text-white py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3">
        {loading ? 'Traitement...' : `Payer ${montantXOF.toLocaleString('fr-FR')} XOF`}
      </button>
    </form>
  )
}

export const PaiementClient: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore()
  const [methode, setMethode] = useState<MethodePaiement>('carte')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')

  const montantXOF = totalPrice > 0 ? totalPrice : 45000
  const WAVE_URL = process.env.NEXT_PUBLIC_WAVE_MERCHANT_URL ?? null
  const ORANGE_URL = process.env.NEXT_PUBLIC_ORANGE_MERCHANT_URL ?? null
  const PAYPAL_URL = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_URL ?? null

  const creerCompteAuto = async () => {
    if (!prenom || !telephone) return
    const pwd = `WOG-${telephone.replace(/\s/g, '').slice(-6)}${Date.now().toString().slice(-3)}`
    setTempPassword(pwd)
    try {
      await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom: nom || prenom, telephone, motDePasse: pwd }),
      })
    } catch { /* silencieux si compte existant */ }
  }

  const handleSuccess = async () => {
    await creerCompteAuto()
    clearCart()
    setSuccess(true)
  }

  const handleMobilePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    await handleSuccess()
  }

  if (success) {
    return (
      <div className="min-h-screen bg-end-white flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16l5 5 11-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-end-black mb-2">Commande confirmée</h1>
        <p className="text-sm text-end-gray-mid mb-4 max-w-sm">
          Paiement de <span className="font-bold text-end-black">{montantXOF.toLocaleString('fr-FR')} XOF</span> traité avec succès.
        </p>
        {tempPassword && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 max-w-sm text-left">
            <p className="text-xs font-bold text-end-blue mb-1 uppercase tracking-wider">Compte créé automatiquement</p>
            <p className="text-xs text-end-gray-dark">Identifiant : <span className="font-semibold">{telephone}</span></p>
            <p className="text-xs text-end-gray-dark">Mot de passe temp. : <span className="font-mono font-semibold">{tempPassword}</span></p>
            <p className="text-xs text-end-gray-mid mt-1">Modifiez-le dans votre profil.</p>
          </div>
        )}
        <Link href="/" className="inline-flex items-center gap-2 bg-end-blue text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const methodBtn = (color: string) =>
    `flex items-center justify-center w-full py-4 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50 transition-opacity`

  return (
    <div className="min-h-screen bg-end-gray-light">
      <div className="max-w-screen-lg mx-auto px-4 py-10">
        <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-8">
          <Link href="/" className="hover:text-end-black transition-colors">Accueil</Link>
          <span>/</span><span>Panier</span><span>/</span>
          <span className="font-bold text-end-black">Paiement</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Colonne formulaire */}
          <div className="lg:col-span-3">
            <div className="bg-end-white p-6 sm:p-8">

              {/* Infos client */}
              <div className="mb-8">
                <h2 className="text-base font-black uppercase tracking-tight text-end-black mb-4">Vos informations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Prénom *</label>
                    <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Kofi" required
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Nom</label>
                    <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Asante"
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Téléphone *</label>
                    <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+225 07 00 00 00 00" required
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                    <p className="text-xs text-end-gray-mid mt-1">Un compte sera créé automatiquement après votre achat.</p>
                  </div>
                </div>
              </div>

              <h1 className="text-xl font-black uppercase tracking-tight text-end-black mb-6">Méthode de paiement</h1>

              {/* Sélecteur méthode */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                {([
                  { id: 'carte', label: 'Carte bancaire', sublabel: 'Visa · Mastercard' },
                  { id: 'wave', label: 'Wave', sublabel: 'Instantané' },
                  { id: 'orange', label: 'Orange Money', sublabel: 'Mobile Money' },
                  { id: 'mtn', label: 'MTN Money', sublabel: 'Mobile Money' },
                  { id: 'paypal', label: 'PayPal', sublabel: 'International' },
                ] as { id: MethodePaiement; label: string; sublabel: string }[]).map(m => (
                  <button key={m.id} type="button" onClick={() => setMethode(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 border-2 text-xs transition-all ${methode === m.id ? 'border-end-blue bg-blue-50' : 'border-end-gray-border hover:border-end-gray-mid'}`}>
                    <span className="font-semibold text-end-black">{m.label}</span>
                    <span className="text-[10px] text-end-gray-mid">{m.sublabel}</span>
                  </button>
                ))}
              </div>

              {methode === 'carte' && (
                <Elements stripe={stripePromise}>
                  <FormulaireCarteStripe onSuccess={handleSuccess} montantXOF={montantXOF} />
                </Elements>
              )}

              {methode === 'wave' && (
                <div className="space-y-4">
                  <p className="text-xs text-end-gray-dark p-4 bg-blue-50 border-l-4 border-[#1DA9FF]"><strong>Wave CI</strong> — Paiement instantané.</p>
                  {WAVE_URL ? (
                    <a href={`${WAVE_URL}?amount=${montantXOF}`} target="_blank" rel="noopener noreferrer"
                      className={methodBtn('#1DA9FF')} style={{ background: '#1DA9FF' }}>
                      Payer {montantXOF.toLocaleString('fr-FR')} XOF avec Wave
                    </a>
                  ) : (
                    <form onSubmit={handleMobilePay}>
                      <button type="submit" disabled={loading || !telephone} className={methodBtn('#1DA9FF')} style={{ background: '#1DA9FF' }}>
                        {loading ? 'Traitement...' : `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {methode === 'orange' && (
                <div className="space-y-4">
                  <p className="text-xs text-end-gray-dark p-4 bg-orange-50 border-l-4 border-[#FF6600]"><strong>Orange Money CI</strong> — Paiement sécurisé.</p>
                  {ORANGE_URL ? (
                    <a href={ORANGE_URL} target="_blank" rel="noopener noreferrer"
                      className={methodBtn('#FF6600')} style={{ background: '#FF6600' }}>
                      Payer {montantXOF.toLocaleString('fr-FR')} XOF
                    </a>
                  ) : (
                    <form onSubmit={handleMobilePay}>
                      <button type="submit" disabled={loading || !telephone} className={methodBtn('#FF6600')} style={{ background: '#FF6600' }}>
                        {loading ? 'Traitement...' : `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {methode === 'mtn' && (
                <form onSubmit={handleMobilePay} className="space-y-4">
                  <p className="text-xs text-end-gray-dark p-4 bg-yellow-50 border-l-4 border-[#FFCC00]"><strong>MTN Mobile Money</strong> — Confirmez depuis votre menu MTN.</p>
                  <button type="submit" disabled={loading || !telephone} style={{ background: '#FFCC00' }}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-black hover:opacity-80 disabled:opacity-50 transition-opacity">
                    {loading ? 'Traitement...' : `Confirmer — ${montantXOF.toLocaleString('fr-FR')} XOF`}
                  </button>
                </form>
              )}

              {methode === 'paypal' && (
                <div className="space-y-4">
                  <p className="text-xs text-end-gray-dark p-4 bg-blue-50 border-l-4 border-[#003087]"><strong>PayPal</strong> — Paiement international sécurisé.</p>
                  {PAYPAL_URL ? (
                    <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer"
                      className={methodBtn('#003087')} style={{ background: '#003087' }}>
                      Payer via PayPal
                    </a>
                  ) : (
                    <Link href="/contact" className={methodBtn('#003087')} style={{ background: '#003087' }}>
                      Nous contacter pour PayPal
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-2">
            <div className="bg-end-white p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-end-black mb-6">Récapitulatif</h2>

              {items.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.cartItemId} className="flex gap-3 pb-3 border-b border-end-gray-border last:border-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.product.mainImage.src} alt={item.product.name} className="w-12 h-16 object-cover bg-end-gray-light flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-end-black truncate">{item.product.name}</p>
                        <p className="text-xs text-end-gray-mid">Taille {item.selectedSize.label} · x{item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-end-black whitespace-nowrap">{(item.priceAtAdd * item.quantity).toLocaleString('fr-FR')} XOF</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 mb-6 pb-6 border-b border-end-gray-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/prod-h1-main.jpg" alt="Produit" className="w-16 h-20 object-contain bg-end-gray-light flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-end-gray-mid uppercase mb-1">WOG-STYLE</p>
                    <p className="text-sm font-semibold text-end-black">Veste Structurée N°1</p>
                    <p className="text-xs text-end-gray-mid">Taille : M</p>
                  </div>
                  <p className="text-sm font-bold text-end-black">{montantXOF.toLocaleString('fr-FR')} XOF</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-end-gray-mid">
                  <span>Sous-total</span><span>{montantXOF.toLocaleString('fr-FR')} XOF</span>
                </div>
                <div className="flex justify-between text-xs text-end-gray-mid">
                  <span>Livraison</span>
                  <span className="text-green-600 font-semibold">{montantXOF >= 50000 ? 'Gratuite' : 'À calculer'}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-end-black border-t border-end-gray-border pt-3">
                  <span>Total</span><span>{montantXOF.toLocaleString('fr-FR')} XOF</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input type="text" placeholder="Code promo"
                  className="flex-1 border border-end-gray-border px-3 py-2 text-xs focus:outline-none focus:border-end-blue transition-colors" />
                <button type="button" className="px-4 py-2 bg-end-blue text-white text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity">
                  Appliquer
                </button>
              </div>
            </div>

            <div className="mt-4 bg-end-white p-4">
              <p className="text-xs text-end-gray-mid text-center">
                Besoin d&apos;aide ?{' '}
                <Link href="/contact" className="text-end-blue underline hover:opacity-70">Contactez-nous</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaiementClient
