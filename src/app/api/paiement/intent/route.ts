/**
 * @fichier app/api/paiement/intent/route.ts
 * @rôle Endpoint Next.js API pour créer un PaymentIntent Stripe.
 *       Appelé depuis PaiementClient quand le client choisit la carte bancaire.
 *       Mode TEST — remplacer la clé secrète par une vraie clé Stripe.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY non configurée')
    }
    stripe = new Stripe(apiKey, { apiVersion: '2025-03-31.basil' })
  }
  return stripe
}

export async function POST(request: NextRequest) {
  try {
    const { montant, devise = 'xof' } = await request.json()

    if (!montant || typeof montant !== 'number' || montant < 100) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('[Stripe] Clé secrète non configurée — paiement par carte désactivé')
      return NextResponse.json(
        { error: 'Paiement par carte non disponible. Utilisez Wave ou Orange Money.' },
        { status: 503 }
      )
    }

    const stripeClient = getStripe()
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: montant,
      currency: devise,
      automatic_payment_methods: { enabled: true },
      metadata: { source: 'wog-style', mode: 'test' },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('[Stripe] Erreur création PaymentIntent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}

