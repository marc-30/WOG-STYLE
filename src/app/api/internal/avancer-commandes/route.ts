import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import { timingSafeEqual } from 'crypto'
import pool from '@/lib/db'
import { sendStatutCommandeEmail } from '@/lib/email'

function secretValide(req: NextRequest): boolean {
  const attendu = process.env.CRON_SECRET
  const recu = req.headers.get('x-cron-secret')
  if (!attendu || !recu) return false
  const a = Buffer.from(attendu)
  const b = Buffer.from(recu)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Appelé toutes les minutes par server.js (cPanel/Passenger) — jamais exposé publiquement.
 *
 * 1. Fait passer automatiquement en EN_PREPARATION toute commande payée depuis 10 minutes,
 *    et prévient le client par email. S'appuie sur `updatedAt`, mis à jour par le webhook au
 *    passage en PAYE : pas de colonne dédiée, et le mécanisme se rattrape tout seul si le
 *    process a été redémarré entre-temps (prochain appel = prochaine vérification).
 *
 * 2. Annule automatiquement toute commande restée EN_ATTENTE plus de 15 minutes (paiement
 *    KadevPay échoué ou abandonné) — la commande est créée avant la tentative de paiement
 *    pour servir de référence au webhook, donc un paiement raté laisse sinon une commande
 *    fantôme qui pollue le tableau de bord. Pas d'email : le client sait déjà que son
 *    paiement n'est pas passé, et le stock n'a jamais été réservé pour ces commandes.
 */
export async function POST(req: NextRequest) {
  if (!secretValide(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, reference, utilisateurId FROM commandes
       WHERE statut='PAYE' AND updatedAt <= (NOW() - INTERVAL 10 MINUTE)`
    )

    let avancees = 0
    for (const commande of rows) {
      await pool.execute("UPDATE commandes SET statut='EN_PREPARATION' WHERE id=?", [commande.id])
      const [userRows] = await pool.execute<RowDataPacket[]>(
        'SELECT prenom, nom, email FROM utilisateurs WHERE id=?', [commande.utilisateurId]
      )
      const utilisateur = userRows[0]
      if (utilisateur) {
        await sendStatutCommandeEmail({
          reference: commande.reference,
          client: { prenom: utilisateur.prenom, nom: utilisateur.nom, email: utilisateur.email },
          statut: 'EN_PREPARATION',
        })
      }
      avancees++
    }

    const [attenteRows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM commandes WHERE statut='EN_ATTENTE' AND createdAt <= (NOW() - INTERVAL 15 MINUTE)`
    )
    let annulees = 0
    for (const commande of attenteRows) {
      await pool.execute("UPDATE commandes SET statut='ANNULE' WHERE id=?", [commande.id])
      annulees++
    }

    return NextResponse.json({ ok: true, avancees, annulees })
  } catch (error) {
    console.error('[POST /api/internal/avancer-commandes]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
