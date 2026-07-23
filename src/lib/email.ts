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
