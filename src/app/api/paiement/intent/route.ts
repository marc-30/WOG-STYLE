/**
 * @fichier app/api/paiement/intent/route.ts
 * @rôle Endpoint Next.js API pour créer un PaymentIntent Stripe.
 *       Appelé depuis PaiementClient quand le client choisit la carte bancaire.
 *       Mode TEST — remplacer la clé secrète par une vraie clé Stripe.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { montant, devise = 'xof' } = await request.json()

    /* Validation basique */
    if (!montant || typeof montant !== 'number' || montant < 100) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    /* Création du PaymentIntent en mode test */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: montant, // En centimes (XOF n'a pas de décimales — passer le montant exact)
      currency: devise,
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: 'wog-style',
        mode: 'test',
      },
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
