import { NextRequest, NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import pool from '@/lib/db'
import { verifyToken, signToken, SESSION_COOKIE } from '@/lib/jwt'
import { sendOrderNotificationEmail } from '@/lib/email'

interface ItemInput { produitId: string; taille: string; quantite: number }

function genererReference(): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `WOG-${Date.now().toString().slice(-8)}-${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, methodePaiement, adresseLivraison, prenom, nom, telephone, email } = body as {
      items: ItemInput[]; methodePaiement: string; adresseLivraison?: string
      prenom?: string; nom?: string; telephone?: string; email?: string
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
    }
    if (!methodePaiement) {
      return NextResponse.json({ error: 'Méthode de paiement requise.' }, { status: 400 })
    }

    // 1. Résoudre l'utilisateur : session existante, sinon recherche/création par téléphone/email.
    let utilisateurId: string | null = null
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (token) {
      const payload = verifyToken(token)
      if (payload) utilisateurId = payload.id
    }

    let nouveauToken: string | null = null

    if (!utilisateurId) {
      if (!telephone && !email) {
        return NextResponse.json({ error: 'Téléphone ou email requis.' }, { status: 400 })
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
        if (!prenom) return NextResponse.json({ error: 'Prénom requis.' }, { status: 400 })
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
    const utilisateur = userRows[0]
    if (!utilisateur) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })

    // 2. Valider le stock et récupérer le prix réel de chaque article (jamais celui envoyé par le client).
    const lignes: { produitId: string; produitNom: string; taille: string; quantite: number; prixUnitaire: number; tailleId: string }[] = []
    let montantTotal = 0

    for (const item of items) {
      if (!item.produitId || !item.taille || !item.quantite || item.quantite < 1) {
        return NextResponse.json({ error: 'Article de panier invalide.' }, { status: 400 })
      }
      const [produitRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, nom, prix, actif FROM produits WHERE id=? LIMIT 1', [item.produitId]
      )
      const produit = produitRows[0]
      if (!produit || !produit.actif) {
        return NextResponse.json({ error: `Produit indisponible : ${item.produitId}` }, { status: 400 })
      }
      const [tailleRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, stock FROM produit_tailles WHERE produitId=? AND label=? LIMIT 1', [item.produitId, item.taille]
      )
      const taille = tailleRows[0]
      if (!taille || taille.stock < item.quantite) {
        return NextResponse.json({ error: `Stock insuffisant pour ${produit.nom} (${item.taille}).` }, { status: 409 })
      }
      lignes.push({
        produitId: produit.id, produitNom: produit.nom, taille: item.taille,
        quantite: item.quantite, prixUnitaire: produit.prix, tailleId: taille.id,
      })
      montantTotal += produit.prix * item.quantite
    }

    // 3. Créer la commande + lignes, décrémenter le stock.
    const commandeId = randomUUID()
    const reference = genererReference()
    await pool.execute(
      `INSERT INTO commandes (id, reference, statut, methodePaiement, montantTotal, adresseLivraison, utilisateurId)
       VALUES (?, ?, 'PAYE', ?, ?, ?, ?)`,
      [commandeId, reference, methodePaiement, montantTotal, adresseLivraison ?? null, utilisateurId]
    )
    for (const l of lignes) {
      await pool.execute(
        `INSERT INTO commande_lignes (id, quantite, prixUnitaire, taille, commandeId, produitId) VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), l.quantite, l.prixUnitaire, l.taille, commandeId, l.produitId]
      )
      await pool.execute('UPDATE produit_tailles SET stock = stock - ? WHERE id=?', [l.quantite, l.tailleId])
      await pool.execute('UPDATE produits SET stock = GREATEST(stock - ?, 0) WHERE id=?', [l.quantite, l.produitId])
    }

    // 4. Email de notification (ne doit jamais faire échouer la commande).
    await sendOrderNotificationEmail({
      reference,
      createdAt: new Date(),
      client: { prenom: utilisateur.prenom, nom: utilisateur.nom, telephone: utilisateur.telephone, email: utilisateur.email },
      lignes: lignes.map(l => ({ produitNom: l.produitNom, taille: l.taille, quantite: l.quantite, prixUnitaire: l.prixUnitaire })),
      montantTotal,
      methodePaiement,
      adresseLivraison: adresseLivraison ?? null,
    })

    const response = NextResponse.json({ commande: { id: commandeId, reference, montantTotal } }, { status: 201 })
    if (nouveauToken) {
      response.cookies.set(SESSION_COOKIE, nouveauToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
      })
    }
    return response
  } catch (error) {
    console.error('[POST /api/commandes]', error)
    return NextResponse.json({ error: 'Erreur serveur lors de la création de la commande.' }, { status: 500 })
  }
}
