import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { RowDataPacket } from 'mysql2'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import pool from '@/lib/db'
import { randomUUID } from 'crypto'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

const COLLECTIONS = [
  {
    slug: 'eden',
    nom: 'Collection EDEN',
    description: 'EDEN — élégance, sensualité et raffinement. Les pièces phares de la saison.',
    imageUrl: '/images/Collection%20EDEN/Champagne%20Royal-1.jpg',
  },
  {
    slug: 'genese',
    nom: 'GENÈSE',
    description: 'Collection fondatrice de WOG-STYLE. Trois univers, une identité.',
    imageUrl: '/images/genese/emeraude-royale-1.jpg',
  },
  {
    slug: 'front-collection',
    nom: 'Front Collection',
    description: 'Les pièces phares WOG, silhouettes intemporelles.',
    imageUrl: '/images/prod-h1-main.jpg',
  },
]

const WOG_PRODUCTS = [
  {
    slug: 'eden-champagne-royal', nom: 'Champagne Royal', prix: 75000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'EXCLUSIVE' as const, stock: 12, categorie: 'editions-limitees',
    description: 'Champagne Royal — élégance et prestige. Une pièce sculpturale qui célèbre la féminité avec éclat.',
    images: ['/images/Collection%20EDEN/Champagne%20Royal-1.jpg', '/images/Collection%20EDEN/Champagne%20Royal-2.jpg', '/images/Collection%20EDEN/Champagne%20Royal-3.jpg', '/images/Collection%20EDEN/Champagne%20Royal-4.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], collectionSlug: 'eden',
  },
  {
    slug: 'eden-ensemble-tabitha-ii', nom: 'Ensemble Tabitha II', prix: 85000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'NEW' as const, stock: 15, categorie: 'vetements',
    description: "Ensemble Tabitha II — deux pièces pensées ensemble. Coupe moderne, tissu noble, allure irréprochable.",
    images: ['/images/Collection%20EDEN/Ensemble%20Tabitha%20II.jpg', '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%281%29.jpg', '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%282%29.jpg', '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%283%29.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], collectionSlug: 'eden',
  },
  {
    slug: 'eden-haut-warriors', nom: 'Haut Warriors', prix: 55000, marque: 'WOG Style',
    genre: 'UNISEXE' as const, statut: 'NEW' as const, stock: 20, categorie: 'vetements',
    description: 'Haut Warriors — force et style. Un haut structuré qui affirme la personnalité avec audace.',
    images: ['/images/Collection%20EDEN/Haut%20Warriors-1.jpg', '/images/Collection%20EDEN/Haut%20Warriors-2.jpg', '/images/Collection%20EDEN/Haut%20Warriors-3.jpg', '/images/Collection%20EDEN/Haut%20Warriors-4.jpg', '/images/Collection%20EDEN/Haut%20Warriors-5.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], collectionSlug: 'eden',
  },
  {
    slug: 'eden-rubis', nom: 'Rubis', prix: 65000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'EXCLUSIVE' as const, stock: 10, categorie: 'editions-limitees',
    description: "Rubis — la couleur du désir. Pièce précieuse aux finitions couture, disponible en quantité limitée.",
    images: ['/images/Collection%20EDEN/Rubis-1.jpg', '/images/Collection%20EDEN/Rubis-2.jpg', '/images/Collection%20EDEN/Rubis-3.jpg', '/images/Collection%20EDEN/Rubis-4.jpg'],
    tailles: ['XS', 'S', 'M', 'L'], collectionSlug: 'eden',
  },
  {
    slug: 'genese-aura-verte', nom: 'Aura Verte Harmonie', prix: 115000, marque: 'WOG Style',
    genre: 'UNISEXE' as const, statut: 'EXCLUSIVE' as const, stock: 15, categorie: 'editions-limitees',
    description: "Forêt et tons profonds. L'Aura Verte incarne la connexion à la nature, traduite en tissu et en coupe.",
    images: ['/images/genese/aura-verte-1.jpg', '/images/genese/aura-verte-2.jpg', '/images/genese/aura-verte-3.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], collectionSlug: 'genese',
  },
  {
    slug: 'genese-bogolan', nom: 'Bogolan', prix: 95000, marque: 'WOG Style',
    genre: 'UNISEXE' as const, statut: 'EXCLUSIVE' as const, stock: 18, categorie: 'editions-limitees',
    description: "Tissu bogolan authentique revisité par WOG. Racines africaines et modernité contemporaine.",
    images: ['/images/genese/bogolan-1.jpg', '/images/genese/bogolan-3.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], collectionSlug: 'genese',
  },
  {
    slug: 'genese-bogolan-royal', nom: 'Bogolan Royal', prix: 125000, marque: 'WOG Style',
    genre: 'HOMME' as const, statut: 'EXCLUSIVE' as const, stock: 10, categorie: 'editions-limitees',
    description: "Héritage textile africain. Le Bogolan Royal rend hommage aux traditions ancestrales avec une modernité absolue.",
    images: ['/images/genese/bogolan-royal-1.jpg', '/images/genese/bogolan-1.jpg'],
    tailles: ['S', 'M', 'L', 'XL'], collectionSlug: 'genese',
  },
  {
    slug: 'genese-emeraude-royale', nom: 'Émeraude Royale', prix: 135000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'EXCLUSIVE' as const, stock: 8, categorie: 'editions-limitees',
    description: "Pièces précieuses et silhouettes sculptées. L'Émeraude Royale est la pièce maîtresse de GENÈSE.",
    images: ['/images/genese/emeraude-royale-1.jpg', '/images/genese/emeraude-royale-2.jpg', '/images/genese/emeraude-royale-3.jpg'],
    tailles: ['XS', 'S', 'M'], collectionSlug: 'genese',
  },
  {
    slug: 'wog-h1-collection-black', nom: 'Collection Noire Homme Vol.1', prix: 85000, marque: 'WOG Style',
    genre: 'HOMME' as const, statut: 'NEW' as const, stock: 24, categorie: 'vetements',
    description: "Pièce signature de la collection homme WOG-STYLE. Silhouette élancée et structurée, pensée pour l'homme contemporain.",
    images: ['/images/prod-h1-main.jpg', '/images/prod-h1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], collectionSlug: null as string | null,
  },
  {
    slug: 'wog-h2-collection-homme-vol2', nom: 'Collection Homme Vol.2', prix: 95000, marque: 'WOG Style',
    genre: 'HOMME' as const, statut: 'EXCLUSIVE' as const, stock: 18, categorie: 'vetements',
    description: 'Deuxième volet de la collection homme, coupes audacieuses et matières nobles.',
    images: ['/images/prod-h2-main.jpg', '/images/prod-h2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], collectionSlug: null as string | null,
  },
  {
    slug: 'wog-h3-lookbook-homme', nom: 'Lookbook Homme — Pièce Phare', prix: 128000, marque: 'WOG Style',
    genre: 'HOMME' as const, statut: 'NEW' as const, stock: 10, categorie: 'vetements',
    description: 'La pièce phare du lookbook homme. Édition très limitée, assemblage artisanal.',
    images: ['/images/prod-h3-main.jpg', '/images/prod-h3-hover.jpg'],
    tailles: ['S', 'M', 'L', 'XL'], collectionSlug: null as string | null,
  },
  {
    slug: 'wog-hom-signature', nom: 'WOG Signature — Homme', prix: 105000, marque: 'WOG Style',
    genre: 'HOMME' as const, statut: 'STANDARD' as const, stock: 22, categorie: 'vetements',
    description: 'La silhouette signature homme de la collection Front. Intemporelle et impeccable.',
    images: ['/images/wog-hom-1.jpg', '/images/prod-h2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], collectionSlug: 'front-collection',
  },
  {
    slug: 'wog-vest-parf-homme', nom: 'Veste Parfaite — WOG Homme', prix: 147000, marque: 'WOG Style',
    genre: 'HOMME' as const, statut: 'EXCLUSIVE' as const, stock: 5, categorie: 'vetements',
    description: 'Pièce spéciale hors collection ordinaire. Confection exclusive, finitions couture.',
    images: ['/images/vest-parf-1.jpg'],
    tailles: ['S', 'M', 'L', 'XL'], collectionSlug: null as string | null,
  },
  {
    slug: 'wog-f1-collection-femme-vol1', nom: 'Collection Femme Vol.1', prix: 79000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'NEW' as const, stock: 20, categorie: 'vetements',
    description: 'Premier opus de la collection femme WOG. Féminité assumée, coupe précise, coloris signature.',
    images: ['/images/prod-f1-main.jpg', '/images/prod-f1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], collectionSlug: null as string | null,
  },
  {
    slug: 'wog-f2-collection-femme-vol2', nom: 'Collection Femme Vol.2', prix: 88000, prixOriginal: 110000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'SALE' as const, stock: 15, categorie: 'vetements',
    description: 'Volume II de la collection femme, silhouettes libres et structurées.',
    images: ['/images/wog-fem-1.jpg', '/images/prod-f2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L'], collectionSlug: null as string | null,
  },
  {
    slug: 'wog-f3-edition-limitee-femme', nom: 'Édition Limitée Femme', prix: 118000, marque: 'WOG Style',
    genre: 'FEMME' as const, statut: 'EXCLUSIVE' as const, stock: 8, categorie: 'editions-limitees',
    description: 'Pièce exclusive de la collection femme, disponible en quantité très limitée.',
    images: ['/images/prod-f3-main.jpg', '/images/prod-f3-hover.jpg'],
    tailles: ['XS', 'S', 'M'], collectionSlug: null as string | null,
  },
]

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const force = body.force === true

    const [countRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM produits')
    const existingCount = Number(countRows[0].cnt)

    if (existingCount > 0 && !force) {
      return NextResponse.json({
        message: `Catalogue déjà initialisé (${existingCount} produits). Utilisez "Forcer la réinitialisation" pour tout recréer.`,
        seeded: false,
      })
    }

    if (force) {
      await pool.execute('DELETE FROM panier_items')
      await pool.execute('DELETE FROM commande_lignes')
      await pool.execute('DELETE FROM commandes')
      await pool.execute('DELETE FROM produit_images')
      await pool.execute('DELETE FROM produit_tailles')
      await pool.execute('DELETE FROM produits')
      await pool.execute('DELETE FROM collections')
    }

    // Upsert admin
    const adminHash = await bcrypt.hash('WogStyle2026!', 12)
    const [existAdmin] = await pool.execute<RowDataPacket[]>("SELECT id FROM utilisateurs WHERE email='admin@wog-style.com' LIMIT 1")
    let adminId: string
    if (existAdmin[0]) {
      adminId = existAdmin[0].id
      await pool.execute("UPDATE utilisateurs SET motDePasse=?, role='ADMIN', actif=1 WHERE id=?", [adminHash, adminId])
    } else {
      adminId = randomUUID()
      await pool.execute(
        "INSERT INTO utilisateurs (id, prenom, nom, email, motDePasse, role, actif) VALUES (?, 'Admin', 'WOG', 'admin@wog-style.com', ?, 'ADMIN', 1)",
        [adminId, adminHash]
      )
    }
    // Supprimer tous les utilisateurs sauf admin
    await pool.execute('DELETE FROM panier_items WHERE utilisateurId != ?', [adminId])
    await pool.execute('DELETE FROM utilisateurs WHERE id != ?', [adminId])

    // Collections
    const collectionMap: Record<string, string> = {}
    for (const col of COLLECTIONS) {
      const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM collections WHERE slug=? LIMIT 1', [col.slug])
      if (existing[0]) {
        collectionMap[col.slug] = existing[0].id
        await pool.execute('UPDATE collections SET nom=?, description=?, imageUrl=? WHERE id=?', [col.nom, col.description, col.imageUrl, existing[0].id])
      } else {
        const id = randomUUID()
        await pool.execute('INSERT INTO collections (id, slug, nom, description, imageUrl) VALUES (?, ?, ?, ?, ?)', [id, col.slug, col.nom, col.description, col.imageUrl])
        collectionMap[col.slug] = id
      }
    }

    // Produits
    let count = 0
    for (const p of WOG_PRODUCTS) {
      const id = randomUUID()
      const prixOriginal = ('prixOriginal' in p ? p.prixOriginal : null) ?? null
      const collectionId = p.collectionSlug ? (collectionMap[p.collectionSlug] ?? null) : null

      await pool.execute(
        `INSERT INTO produits (id, slug, nom, description, prix, prixOriginal, marque, genre, statut, stock, actif, categorie, collectionId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [id, p.slug, p.nom, p.description, p.prix, prixOriginal, p.marque, p.genre, p.statut, p.stock, p.categorie, collectionId]
      )
      for (let i = 0; i < p.images.length; i++) {
        await pool.execute('INSERT INTO produit_images (id, url, ordre, isHover, produitId) VALUES (?, ?, ?, ?, ?)', [randomUUID(), p.images[i], i, i === 1 ? 1 : 0, id])
      }
      for (const label of p.tailles) {
        await pool.execute('INSERT INTO produit_tailles (id, label, stock, disponible, produitId) VALUES (?, ?, ?, 1, ?)', [randomUUID(), label, Math.floor(p.stock / p.tailles.length), id])
      }
      count++
    }

    return NextResponse.json({
      message: `✅ ${count} produits initialisés avec succès.`,
      admin: { email: 'admin@wog-style.com', motDePasse: 'WogStyle2026!' },
      seeded: true,
    })
  } catch (error) {
    console.error('[POST /api/admin/seed]', error)
    return NextResponse.json({ error: "Erreur serveur lors de l'initialisation." }, { status: 500 })
  }
}
