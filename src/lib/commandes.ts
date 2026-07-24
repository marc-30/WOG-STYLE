import { RowDataPacket } from 'mysql2'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import pool from '@/lib/db'
import { verifyToken, signToken, SESSION_COOKIE } from '@/lib/jwt'

export interface ItemInput { produitId: string; taille: string; quantite: number }

export interface CreerCommandeParams {
  items: ItemInput[]
  methodePaiement: string
  adresseLivraison?: string
  prenom?: string
  nom?: string
  telephone?: string
  email?: string
  statut: 'PAYE' | 'EN_ATTENTE'
  decrementerStock: boolean
  /** Token de session existant (cookie), si présent. */
  sessionToken?: string
}

export interface CreerCommandeLigne {
  produitId: string; produitNom: string; taille: string
  quantite: number; prixUnitaire: number; tailleId: string
}

export interface CreerCommandeResult {
  commandeId: string
  reference: string
  montantTotal: number
  lignes: CreerCommandeLigne[]
  utilisateur: { id: string; prenom: string; nom: string; telephone: string | null; email: string | null }
  /** Nouveau token de session à poser en cookie, si un compte a été créé/retrouvé sans session existante. */
  nouveauToken: string | null
}

export class CommandeError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function genererReference(): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `WOG-${Date.now().toString().slice(-8)}-${suffix}`
}

/**
 * Résout l'utilisateur, valide le stock, **relit toujours le prix réel en base**
 * (jamais une valeur envoyée par le client), crée la commande + ses lignes.
 * Ne décrémente le stock que si `decrementerStock` est vrai — pour un paiement
 * en attente de confirmation (ex: KadevPay), le stock n'est réservé qu'à la
 * confirmation réelle (webhook), pas à la simple initiation.
 */
export async function creerCommande(params: CreerCommandeParams): Promise<CreerCommandeResult> {
  const { items, methodePaiement, adresseLivraison, prenom, nom, telephone, email, statut, decrementerStock, sessionToken } = params

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new CommandeError('Panier vide.', 400)
  }
  if (!methodePaiement) {
    throw new CommandeError('Méthode de paiement requise.', 400)
  }

  // 1. Résoudre l'utilisateur : session existante, sinon recherche/création par téléphone/email.
  let utilisateurId: string | null = null
  if (sessionToken) {
    const payload = verifyToken(sessionToken)
    if (payload) utilisateurId = payload.id
  }

  let nouveauToken: string | null = null

  if (!utilisateurId) {
    if (!telephone && !email) {
      throw new CommandeError('Téléphone ou email requis.', 400)
    }
    const conditions: string[] = []
    const vals: string[] = []
    if (email) { conditions.push('email=?'); vals.push(email.toLowerCase()) }
    if (telephone) { conditions.push('telephone=?'); vals.push(telephone) }
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM utilisateurs WHERE ${conditions.join(' OR ')} LIMIT 1`, vals
    )
    if (existing[0]) {
      utilisateurId = existing[0].id
    } else {
      if (!prenom) throw new CommandeError('Prénom requis.', 400)
      const hash = await bcrypt.hash(randomUUID(), 12)
      utilisateurId = randomUUID()
      await pool.execute(
        `INSERT INTO utilisateurs (id, prenom, nom, email, telephone, motDePasse, role, actif) VALUES (?, ?, ?, ?, ?, ?, 'CLIENT', 1)`,
        [utilisateurId, prenom.trim(), nom?.trim() || prenom.trim(), email ? email.toLowerCase().trim() : null, telephone?.trim() || null, hash]
      )
    }
    nouveauToken = signToken({ id: utilisateurId!, prenom: prenom ?? '', nom: nom ?? '', email, telephone, role: 'CLIENT' })
  }

  const [userRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, prenom, nom, telephone, email FROM utilisateurs WHERE id=?', [utilisateurId]
  )
  const userRow = userRows[0]
  if (!userRow) throw new CommandeError('Utilisateur introuvable.', 404)
  const utilisateur = {
    id: userRow.id as string, prenom: userRow.prenom as string, nom: userRow.nom as string,
    telephone: userRow.telephone as string | null, email: userRow.email as string | null,
  }

  // 2. Valider le stock et récupérer le prix réel de chaque article (jamais celui envoyé par le client).
  const lignes: CreerCommandeLigne[] = []
  let montantTotal = 0

  for (const item of items) {
    if (!item.produitId || !item.taille || !item.quantite || item.quantite < 1) {
      throw new CommandeError('Article de panier invalide.', 400)
    }
    const [produitRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nom, prix, actif FROM produits WHERE id=? LIMIT 1', [item.produitId]
    )
    const produit = produitRows[0]
    if (!produit || !produit.actif) {
      throw new CommandeError(`Produit indisponible : ${item.produitId}`, 400)
    }
    const [tailleRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, stock FROM produit_tailles WHERE produitId=? AND label=? LIMIT 1', [item.produitId, item.taille]
    )
    const taille = tailleRows[0]
    if (!taille || taille.stock < item.quantite) {
      throw new CommandeError(`Stock insuffisant pour ${produit.nom} (${item.taille}).`, 409)
    }
    lignes.push({
      produitId: produit.id, produitNom: produit.nom, taille: item.taille,
      quantite: item.quantite, prixUnitaire: produit.prix, tailleId: taille.id,
    })
    montantTotal += produit.prix * item.quantite
  }

  // 3. Créer la commande + lignes, décrémenter le stock si demandé.
  const commandeId = randomUUID()
  const reference = genererReference()
  await pool.execute(
    `INSERT INTO commandes (id, reference, statut, methodePaiement, montantTotal, adresseLivraison, utilisateurId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [commandeId, reference, statut, methodePaiement, montantTotal, adresseLivraison ?? null, utilisateurId]
  )
  for (const l of lignes) {
    await pool.execute(
      `INSERT INTO commande_lignes (id, quantite, prixUnitaire, taille, commandeId, produitId) VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), l.quantite, l.prixUnitaire, l.taille, commandeId, l.produitId]
    )
    if (decrementerStock) {
      await pool.execute('UPDATE produit_tailles SET stock = stock - ? WHERE id=?', [l.quantite, l.tailleId])
      await pool.execute('UPDATE produits SET stock = GREATEST(stock - ?, 0) WHERE id=?', [l.quantite, l.produitId])
    }
  }

  return { commandeId, reference, montantTotal, lignes, utilisateur, nouveauToken }
}

/** Décrémente le stock pour une commande déjà créée (utilisé à la confirmation webhook). */
export async function decrementerStockCommande(lignes: { tailleId: string; produitId: string; quantite: number }[]) {
  for (const l of lignes) {
    await pool.execute('UPDATE produit_tailles SET stock = stock - ? WHERE id=?', [l.quantite, l.tailleId])
    await pool.execute('UPDATE produits SET stock = GREATEST(stock - ?, 0) WHERE id=?', [l.quantite, l.produitId])
  }
}
