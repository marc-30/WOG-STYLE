'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useCartStore } from '@/store/cartStore'

declare global {
  interface Window {
    KadevPay?: {
      checkout: (options: {
        public_key: string
        amount: number
        email?: string
        name?: string
        phone?: string
        method: 'momo' | 'card'
        callback_url: string
        metadata?: Record<string, string>
        onSuccess?: () => void
        onClose?: () => void
      }) => void
    }
  }
}

interface CompteConnecte { prenom: string; nom: string; email: string | null; telephone: string | null }

export const PaiementClient: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresseLivraison, setAdresseLivraison] = useState('')
  const [reference, setReference] = useState('')
  const [compteConnecte, setCompteConnecte] = useState<CompteConnecte | null>(null)
  const [email, setEmail] = useState('')
  const [kadevError, setKadevError] = useState('')

  const montantXOF = totalPrice > 0 ? totalPrice : 45000

  // Si le client est déjà connecté, on récupère ses infos pour ne plus jamais les redemander.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : { user: null })
      .then(data => {
        if (data.user) {
          setCompteConnecte(data.user)
          setPrenom(data.user.prenom)
          setNom(data.user.nom)
          setTelephone(data.user.telephone ?? '')
          setEmail(data.user.email ?? '')
        }
      })
      .catch(() => {})
  }, [])

  const handleKadevPay = async (methodeKadev: 'momo' | 'card') => {
    setKadevError('')
    if (!window.KadevPay) { setKadevError('Le module de paiement est encore en chargement, réessaie dans un instant.'); return }
    setLoading(true)
    try {
      // Le serveur recalcule le montant réel du panier — jamais une valeur du navigateur.
      // Si le client n'a pas de compte, le serveur en crée un et lui envoie ses identifiants par email.
      const res = await fetch('/api/paiement/kadev/init', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            produitId: item.product.id, taille: item.selectedSize.label, quantite: item.quantity,
          })),
          methodePaiement: 'kadevpay',
          adresseLivraison, prenom, nom, telephone, email,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.commande) {
        setKadevError(data.error || 'Impossible d\'initier le paiement.')
        setLoading(false)
        return
      }

      const { reference: commandeReference, montantTotal: montantServeur } = data.commande

      window.KadevPay.checkout({
        public_key: process.env.NEXT_PUBLIC_KADEVPAY_PUBLIC_KEY ?? '',
        amount: montantServeur,
        email, name: `${prenom} ${nom}`.trim(), phone: telephone,
        method: methodeKadev,
        callback_url: typeof window !== 'undefined' ? window.location.origin + '/paiement' : '',
        metadata: { commandeReference },
        onSuccess: () => {
          clearCart()
          setReference(commandeReference)
          setSuccess(true)
          setLoading(false)
        },
        onClose: () => setLoading(false),
      })
    } catch {
      setKadevError('Erreur réseau. Réessaie.')
      setLoading(false)
    }
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
        <p className="text-sm text-end-gray-mid mb-1 max-w-sm">
          Paiement de <span className="font-bold text-end-black">{montantXOF.toLocaleString('fr-FR')} XOF</span> traité avec succès.
        </p>
        {reference && (
          <p className="text-xs text-end-gray-mid mb-4">Référence commande : <span className="font-mono font-semibold text-end-black">{reference}</span></p>
        )}
        {!compteConnecte && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 max-w-sm text-left">
            <p className="text-xs font-bold text-end-blue mb-1 uppercase tracking-wider">Compte créé automatiquement</p>
            <p className="text-xs text-end-gray-dark">Tes identifiants de connexion t&apos;ont été envoyés par email à <span className="font-semibold">{email}</span>.</p>
          </div>
        )}
        <Link href="/" className="inline-flex items-center gap-2 bg-end-blue text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-end-gray-light">
      <Script src="https://pay.kadev.ci/js/v1/kadev-pay.js" strategy="lazyOnload" />
      <div className="max-w-screen-lg mx-auto px-4 py-6 sm:py-10">
        <nav className="flex items-center gap-2 text-xs text-end-gray-mid mb-6">
          <Link href="/" className="hover:text-end-black transition-colors">Accueil</Link>
          <span>/</span><span>Panier</span><span>/</span>
          <span className="font-bold text-end-black">Paiement</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8">
          {/* Colonne formulaire */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-end-white p-4 sm:p-8">

              {/* Infos client */}
              <div className="mb-8">
                <h2 className="text-base font-black uppercase tracking-tight text-end-black mb-4">Vos informations</h2>
                {compteConnecte && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200">
                    <div className="w-9 h-9 rounded-full bg-end-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {compteConnecte.prenom[0]}{compteConnecte.nom[0]}
                    </div>
                    <p className="text-xs text-end-gray-dark">
                      Connecté en tant que <span className="font-semibold text-end-black">{compteConnecte.prenom} {compteConnecte.nom}</span>
                      {compteConnecte.telephone && ` · ${compteConnecte.telephone}`}
                    </p>
                  </div>
                )}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${compteConnecte ? 'hidden' : ''}`}>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Prénom *</label>
                    <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Kofi" required={!compteConnecte}
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Nom</label>
                    <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Asante"
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Téléphone *</label>
                    <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="05 85 49 48 48" required
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                    {!compteConnecte && <p className="text-xs text-end-gray-mid mt-1">Un compte sera créé automatiquement après votre achat.</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Adresse de livraison *</label>
                    <textarea value={adresseLivraison} onChange={e => setAdresseLivraison(e.target.value)} required rows={3}
                      placeholder="Quartier, rue, indications (ex: Cocody Angré, Rue des Jardins, villa 12...)"
                      className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors resize-none" />
                  </div>
                </div>
              </div>

              <h1 className="text-xl font-black uppercase tracking-tight text-end-black mb-6">Paiement</h1>

              <div className="space-y-4">
                <p className="text-xs text-end-gray-dark p-4 bg-emerald-50 border-l-4 border-emerald-500">
                  <strong>KadevPay</strong> — Mobile Money ou carte bancaire, paiement sécurisé.
                </p>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="toi@exemple.com"
                    className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-blue transition-colors" />
                </div>
                {kadevError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3">{kadevError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleKadevPay('momo')}
                    disabled={loading || !telephone || !adresseLivraison || !email}
                    className="py-4 text-xs font-bold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
                    style={{ background: '#059669' }}>
                    {loading ? 'Traitement...' : 'Mobile Money'}
                  </button>
                  <button type="button" onClick={() => handleKadevPay('card')}
                    disabled={loading || !telephone || !adresseLivraison || !email}
                    className="py-4 text-xs font-bold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
                    style={{ background: '#047857' }}>
                    {loading ? 'Traitement...' : 'Carte bancaire'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif — affiché EN PREMIER sur mobile */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-end-white p-4 sm:p-6">
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
