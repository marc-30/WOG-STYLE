import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { createHmac, timingSafeEqual } from 'crypto'
import pool from '@/lib/db'
import { decrementerStockCommande } from '@/lib/commandes'
import { sendOrderNotificationEmail, sendConfirmationPaiementEmail } from '@/lib/email'

function signatureValide(rawBody: string, signatureRecue: string | null): boolean {
  const secret = process.env.KADEVPAY_WEBHOOK_SECRET
  if (!secret || !signatureRecue) return false
  const attendue = createHmac('sha512', secret).update(rawBody).digest('hex')
  const a = Buffer.from(attendue)
  const b = Buffer.from(signatureRecue)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Deuxième vérification indépendante — ne fait jamais confiance au seul payload du webhook. */
async function verifierTransaction(reference: string): Promise<{ montant: number; statut: string } | null> {
  try {
    const res = await fetch(`https://pay.kadev.ci/api/v1/transactions/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.KADEVPAY_SECRET_KEY}` },
    })
    if (!res.ok) {
      console.error('[kadev/webhook] Échec vérification transaction, status', res.status)
      return null
    }
    const json = await res.json()
    console.log('[kadev/webhook] Réponse verify brute:', JSON.stringify(json))
    const data = json.data ?? json
    const montant = Number(data.amount ?? data.montant)
    const statut = String(data.status ?? data.statut ?? '').toLowerCase()
    if (!Number.isFinite(montant)) return null
    return { montant, statut }
  } catch (error) {
    console.error('[kadev/webhook] Erreur appel verify', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-kadevpay-signature')

  if (!signatureValide(rawBody, signature)) {
    console.error('[kadev/webhook] Signature invalide ou absente')
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }
  console.log('[kadev/webhook] Payload reçu:', JSON.stringify(payload))

  const data = payload.data ?? payload
  const transactionReference: string | undefined = data.reference
  const commandeReference: string | undefined = data.metadata?.commandeReference
  const statutWebhook = String(data.status ?? '').toLowerCase()

  if (!transactionReference || !commandeReference) {
    console.error('[kadev/webhook] Référence(s) manquante(s) dans le payload')
    return NextResponse.json({ error: 'Référence manquante.' }, { status: 400 })
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM commandes WHERE reference=? LIMIT 1', [commandeReference]
  )
  const commande = rows[0]
  if (!commande) {
    console.error('[kadev/webhook] Commande introuvable pour la référence', commandeReference)
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
  }

  if (commande.statut === 'PAYE') {
    // Déjà confirmée (webhook potentiellement renvoyé plusieurs fois) — on répond OK sans rien refaire.
    return NextResponse.json({ ok: true, deja_confirmee: true })
  }

  const verification = await verifierTransaction(transactionReference)
  const montantWebhook = Number(data.amount)
  const montantAttendu = Number(commande.montantTotal)

  const montantConfirme = verification?.montant
  const statutConfirme = verification?.statut ?? statutWebhook

  const estPaye = statutConfirme === 'paid' || statutConfirme === 'success' || statutWebhook === 'payment.success' || statutWebhook === 'paid'
  const montantsCoherents =
    montantWebhook === montantAttendu && (montantConfirme === undefined || montantConfirme === montantAttendu)

  if (!estPaye || !montantsCoherents) {
    console.error('[kadev/webhook] Rejet — statut ou montant incohérent', {
      commandeReference, montantAttendu, montantWebhook, montantConfirme, statutConfirme,
    })
    return NextResponse.json({ error: 'Statut ou montant non confirmé.' }, { status: 400 })
  }

  // Tout est cohérent : on décrémente le stock maintenant (pas avant), on valide la commande, on notifie.
  const [ligneRows] = await pool.execute<RowDataPacket[]>(
    `SELECT cl.quantite, cl.produitId, pt.id AS tailleId
     FROM commande_lignes cl
     JOIN produit_tailles pt ON pt.produitId = cl.produitId AND pt.label = cl.taille
     WHERE cl.commandeId = ?`,
    [commande.id]
  )
  await decrementerStockCommande(ligneRows.map(l => ({ tailleId: l.tailleId, produitId: l.produitId, quantite: l.quantite })))
  await pool.execute("UPDATE commandes SET statut='PAYE' WHERE id=?", [commande.id])

  const [lignesDetail] = await pool.execute<RowDataPacket[]>(
    `SELECT cl.quantite, cl.prixUnitaire, cl.taille, p.nom AS produitNom
     FROM commande_lignes cl JOIN produits p ON p.id = cl.produitId
     WHERE cl.commandeId = ?`,
    [commande.id]
  )
  const [userRows] = await pool.execute<RowDataPacket[]>(
    'SELECT prenom, nom, telephone, email FROM utilisateurs WHERE id=?', [commande.utilisateurId]
  )
  const utilisateur = userRows[0]

  await sendOrderNotificationEmail({
    reference: commande.reference,
    createdAt: new Date(),
    client: { prenom: utilisateur.prenom, nom: utilisateur.nom, telephone: utilisateur.telephone, email: utilisateur.email },
    lignes: lignesDetail.map(l => ({ produitNom: l.produitNom, taille: l.taille, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
    montantTotal: commande.montantTotal,
    methodePaiement: commande.methodePaiement,
    adresseLivraison: commande.adresseLivraison,
  })

  await sendConfirmationPaiementEmail({
    reference: commande.reference,
    client: { prenom: utilisateur.prenom, nom: utilisateur.nom, email: utilisateur.email },
    statut: 'PAYE',
  })

  return NextResponse.json({ ok: true })
}
