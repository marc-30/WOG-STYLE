import { Resend } from 'resend'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY non configurée')
    resend = new Resend(apiKey)
  }
  return resend
}

export interface CommandeEmailLigne {
  produitNom: string
  taille: string
  quantite: number
  prixUnitaire: number
}

export interface CommandeEmailData {
  reference: string
  createdAt: Date
  client: { prenom: string; nom: string; telephone: string | null; email: string | null }
  lignes: CommandeEmailLigne[]
  montantTotal: number
  methodePaiement: string
  adresseLivraison: string | null
}

const formatXOF = (n: number) => `${n.toLocaleString('fr-FR')} XOF`

function buildHtml(commande: CommandeEmailData): string {
  const lignesHtml = commande.lignes.map(l => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${l.produitNom}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${l.taille}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${l.quantite}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatXOF(l.prixUnitaire)}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <h2 style="margin-bottom:4px;">Nouvelle commande WOG-STYLE</h2>
      <p style="color:#666;margin-top:0;">Référence : <strong>${commande.reference}</strong> — ${commande.createdAt.toLocaleString('fr-FR')}</p>

      <h3>Client</h3>
      <p>
        ${commande.client.prenom} ${commande.client.nom}<br/>
        ${commande.client.telephone ? `Téléphone : ${commande.client.telephone}<br/>` : ''}
        ${commande.client.email ? `Email : ${commande.client.email}<br/>` : ''}
      </p>

      <h3>Livraison</h3>
      <p>${commande.adresseLivraison ? commande.adresseLivraison.replace(/\n/g, '<br/>') : 'Non renseignée'}</p>

      <h3>Articles</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;">Produit</th>
            <th style="padding:8px;text-align:center;">Taille</th>
            <th style="padding:8px;text-align:center;">Qté</th>
            <th style="padding:8px;text-align:right;">Prix</th>
          </tr>
        </thead>
        <tbody>${lignesHtml}</tbody>
      </table>

      <p style="text-align:right;font-size:16px;margin-top:12px;">
        <strong>Total : ${formatXOF(commande.montantTotal)}</strong>
      </p>
      <p style="color:#666;">Méthode de paiement : ${commande.methodePaiement}</p>
    </div>
  `
}

/** Envoie l'email de notification de commande à l'admin. Ne lève jamais — une erreur d'envoi ne doit pas bloquer la commande. */
export async function sendOrderNotificationEmail(commande: CommandeEmailData): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!to) {
    console.warn('[email] ADMIN_NOTIFICATION_EMAIL non configurée — email non envoyé')
    return
  }
  try {
    await getResend().emails.send({
      from: 'WOG-STYLE <onboarding@resend.dev>',
      to,
      subject: `Nouvelle commande ${commande.reference} — ${formatXOF(commande.montantTotal)}`,
      html: buildHtml(commande),
    })
  } catch (error) {
    console.error('[email] Échec envoi notification commande', error)
  }
}

/* ============================================================
 * EMAILS CLIENT — bienvenue, confirmation de paiement, statut colis
 * ============================================================ */

/** Doit rester synchronisé avec `statutFR` dans src/app/admin/commandes/page.tsx. */
export const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente de paiement',
  PAYE: 'Payé',
  EN_PREPARATION: 'En préparation',
  EXPEDIE: 'Expédié',
  LIVRE: 'Livré',
  ANNULE: 'Annulé',
}

export interface StatutEmailData {
  reference: string
  client: { prenom: string; nom: string; email: string | null }
  statut: string
}

function buildStatutHtml(data: StatutEmailData, intro: string): string {
  const label = STATUT_LABELS[data.statut] ?? data.statut
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <h2 style="margin-bottom:4px;">Bonjour ${data.client.prenom},</h2>
      <p>${intro}</p>
      <p style="color:#666;margin-top:16px;">Référence commande : <strong>${data.reference}</strong></p>
      <p style="font-size:15px;margin-top:8px;">
        État de votre colis :
        <strong style="display:inline-block;margin-left:4px;padding:4px 10px;background:#f5f5f5;border-radius:4px;">${label}</strong>
      </p>
      <p style="color:#999;font-size:12px;margin-top:24px;">WOG-STYLE — Merci de votre confiance.</p>
    </div>
  `
}

/** Envoie la confirmation de paiement au client. Ne lève jamais. */
export async function sendConfirmationPaiementEmail(data: StatutEmailData): Promise<void> {
  if (!data.client.email) return
  try {
    await getResend().emails.send({
      from: 'WOG-STYLE <onboarding@resend.dev>',
      to: data.client.email,
      subject: `Paiement confirmé — commande ${data.reference}`,
      html: buildStatutHtml(data, 'Nous avons bien reçu votre paiement, merci pour votre commande !'),
    })
  } catch (error) {
    console.error('[email] Échec envoi confirmation paiement', error)
  }
}

/** Envoie une notification de changement de statut au client. Ne lève jamais. */
export async function sendStatutCommandeEmail(data: StatutEmailData): Promise<void> {
  if (!data.client.email) return
  try {
    await getResend().emails.send({
      from: 'WOG-STYLE <onboarding@resend.dev>',
      to: data.client.email,
      subject: `Mise à jour de votre commande ${data.reference}`,
      html: buildStatutHtml(data, "Le statut de votre commande vient d'être mis à jour."),
    })
  } catch (error) {
    console.error('[email] Échec envoi mise à jour statut', error)
  }
}

/** Envoie les identifiants du compte créé automatiquement lors d'un achat sans connexion. Ne lève jamais. */
export async function sendBienvenueCompteEmail(data: { prenom: string; email: string; motDePasseTemp: string }): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'WOG-STYLE <onboarding@resend.dev>',
      to: data.email,
      subject: 'Ton compte WOG-STYLE',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
          <h2 style="margin-bottom:4px;">Bienvenue ${data.prenom} !</h2>
          <p>Un compte a été créé automatiquement pour toi lors de ton achat sur WOG-STYLE.</p>
          <p style="margin-top:16px;">
            Identifiant : <strong>${data.email}</strong><br/>
            Mot de passe temporaire : <strong>${data.motDePasseTemp}</strong>
          </p>
          <p style="color:#666;font-size:13px;margin-top:12px;">Nous te recommandons de le modifier depuis ton profil après connexion.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('[email] Échec envoi bienvenue compte', error)
  }
}
