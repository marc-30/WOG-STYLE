import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/jwt'
import { creerCommande, CommandeError, type ItemInput } from '@/lib/commandes'
import { sendBienvenueCompteEmail } from '@/lib/email'

/**
 * Crée une commande EN_ATTENTE avec le montant réel calculé côté serveur
 * (jamais celui envoyé par le client) et sans décrémenter le stock — le
 * stock n'est réservé qu'à la confirmation réelle du paiement (webhook).
 * Le front utilise le `montantTotal` retourné ici, et lui seul, pour ouvrir
 * le SDK KadevPay.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, methodePaiement, adresseLivraison, prenom, nom, telephone, email } = body as {
      items: ItemInput[]; methodePaiement: string; adresseLivraison?: string
      prenom?: string; nom?: string; telephone?: string; email?: string
    }

    const result = await creerCommande({
      items, methodePaiement: methodePaiement || 'kadevpay', adresseLivraison, prenom, nom, telephone, email,
      statut: 'EN_ATTENTE',
      decrementerStock: false,
      sessionToken: req.cookies.get(SESSION_COOKIE)?.value,
    })

    if (result.compteCree && result.motDePasseTemp && result.utilisateur.email) {
      await sendBienvenueCompteEmail({
        prenom: result.utilisateur.prenom,
        email: result.utilisateur.email,
        motDePasseTemp: result.motDePasseTemp,
      })
    }

    const response = NextResponse.json(
      { commande: { id: result.commandeId, reference: result.reference, montantTotal: result.montantTotal } },
      { status: 201 }
    )
    if (result.nouveauToken) {
      response.cookies.set(SESSION_COOKIE, result.nouveauToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
      })
    }
    return response
  } catch (error) {
    if (error instanceof CommandeError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[POST /api/paiement/kadev/init]', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'initiation du paiement.' }, { status: 500 })
  }
}
