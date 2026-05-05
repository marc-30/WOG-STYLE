/**
 * POST /api/admin/seed
 * Initialise ou réinitialise le catalogue (collections + produits) et l'admin.
 * Body JSON optionnel : { force: true } pour réinitialiser même si la DB n'est pas vide.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

// ── Collections ───────────────────────────────────────────────────────────────
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

// ── Produits ──────────────────────────────────────────────────────────────────
const WOG_PRODUCTS = [

  // ── Collection EDEN ───────────────────────────────────────────────────────
  {
    slug: 'eden-champagne-royal',
    nom: 'Champagne Royal',
    prix: 75000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 12,
    categorie: 'editions-limitees',
    description: 'Champagne Royal — élégance et prestige. Une pièce sculpturale qui célèbre la féminité avec éclat.',
    images: [
      '/images/Collection%20EDEN/Champagne%20Royal-1.jpg',
      '/images/Collection%20EDEN/Champagne%20Royal-2.jpg',
      '/images/Collection%20EDEN/Champagne%20Royal-3.jpg',
      '/images/Collection%20EDEN/Champagne%20Royal-4.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
    collectionSlug: 'eden',
  },
  {
    slug: 'eden-ensemble-tabitha-ii',
    nom: 'Ensemble Tabitha II',
    prix: 85000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'NEW' as const,
    stock: 15,
    categorie: 'vetements',
    description: "Ensemble Tabitha II — deux pièces pensées ensemble. Coupe moderne, tissu noble, allure irréprochable.",
    images: [
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II.jpg',
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%281%29.jpg',
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%282%29.jpg',
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%283%29.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
    collectionSlug: 'eden',
  },
  {
    slug: 'eden-haut-warriors',
    nom: 'Haut Warriors',
    prix: 55000,
    marque: 'WOG Style',
    genre: 'UNISEXE' as const,
    statut: 'NEW' as const,
    stock: 20,
    categorie: 'vetements',
    description: 'Haut Warriors — force et style. Un haut structuré qui affirme la personnalité avec audace.',
    images: [
      '/images/Collection%20EDEN/Haut%20Warriors-1.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-2.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-3.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-4.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-5.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    collectionSlug: 'eden',
  },
  {
    slug: 'eden-rubis',
    nom: 'Rubis',
    prix: 65000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 10,
    categorie: 'editions-limitees',
    description: "Rubis — la couleur du désir. Pièce précieuse aux finitions couture, disponible en quantité limitée.",
    images: [
      '/images/Collection%20EDEN/Rubis-1.jpg',
      '/images/Collection%20EDEN/Rubis-2.jpg',
      '/images/Collection%20EDEN/Rubis-3.jpg',
      '/images/Collection%20EDEN/Rubis-4.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L'],
    collectionSlug: 'eden',
  },

  // ── Collection GENÈSE ─────────────────────────────────────────────────────
  {
    slug: 'genese-aura-verte',
    nom: 'Aura Verte Harmonie',
    prix: 115000,
    marque: 'WOG Style',
    genre: 'UNISEXE' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 15,
    categorie: 'editions-limitees',
    description: "Forêt et tons profonds. L'Aura Verte incarne la connexion à la nature, traduite en tissu et en coupe.",
    images: [
      '/images/genese/aura-verte-1.jpg',
      '/images/genese/aura-verte-2.jpg',
      '/images/genese/aura-verte-3.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
    collectionSlug: 'genese',
  },
  {
    slug: 'genese-bogolan',
    nom: 'Bogolan',
    prix: 95000,
    marque: 'WOG Style',
    genre: 'UNISEXE' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 18,
    categorie: 'editions-limitees',
    description: "Tissu bogolan authentique revisité par WOG. Racines africaines et modernité contemporaine.",
    images: [
      '/images/genese/bogolan-1.jpg',
      '/images/genese/bogolan-3.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    collectionSlug: 'genese',
  },
  {
    slug: 'genese-bogolan-royal',
    nom: 'Bogolan Royal',
    prix: 125000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 10,
    categorie: 'editions-limitees',
    description: "Héritage textile africain. Le Bogolan Royal rend hommage aux traditions ancestrales avec une modernité absolue.",
    images: [
      '/images/genese/bogolan-royal-1.jpg',
      '/images/genese/bogolan-1.jpg',
    ],
    tailles: ['S', 'M', 'L', 'XL'],
    collectionSlug: 'genese',
  },
  {
    slug: 'genese-emeraude-royale',
    nom: 'Émeraude Royale',
    prix: 135000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 8,
    categorie: 'editions-limitees',
    description: "Pièces précieuses et silhouettes sculptées. L'Émeraude Royale est la pièce maîtresse de GENÈSE.",
    images: [
      '/images/genese/emeraude-royale-1.jpg',
      '/images/genese/emeraude-royale-2.jpg',
      '/images/genese/emeraude-royale-3.jpg',
    ],
    tailles: ['XS', 'S', 'M'],
    collectionSlug: 'genese',
  },

  // ── Front Collection ──────────────────────────────────────────────────────
  {
    slug: 'wog-h1-collection-black',
    nom: 'Collection Noire Homme Vol.1',
    prix: 85000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'NEW' as const,
    stock: 24,
    categorie: 'vetements',
    description: "Pièce signature de la collection homme WOG-STYLE. Silhouette élancée et structurée, pensée pour l'homme contemporain.",
    images: ['/images/prod-h1-main.jpg', '/images/prod-h1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-h2-collection-homme-vol2',
    nom: 'Collection Homme Vol.2',
    prix: 95000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 18,
    categorie: 'vetements',
    description: 'Deuxième volet de la collection homme, coupes audacieuses et matières nobles.',
    images: ['/images/prod-h2-main.jpg', '/images/prod-h2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-h3-lookbook-homme',
    nom: 'Lookbook Homme — Pièce Phare',
    prix: 128000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'NEW' as const,
    stock: 10,
    categorie: 'vetements',
    description: 'La pièce phare du lookbook homme. Édition très limitée, assemblage artisanal.',
    images: ['/images/prod-h3-main.jpg', '/images/prod-h3-hover.jpg'],
    tailles: ['S', 'M', 'L', 'XL'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-hom-signature',
    nom: 'WOG Signature — Homme',
    prix: 105000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'STANDARD' as const,
    stock: 22,
    categorie: 'vetements',
    description: 'La silhouette signature homme de la collection Front. Intemporelle et impeccable.',
    images: ['/images/wog-hom-1.jpg', '/images/prod-h2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    collectionSlug: 'front-collection',
  },
  {
    slug: 'wog-vest-parf-homme',
    nom: 'Veste Parfaite — WOG Homme',
    prix: 147000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 5,
    categorie: 'vetements',
    description: 'Pièce spéciale hors collection ordinaire. Confection exclusive, finitions couture.',
    images: ['/images/vest-parf-1.jpg', '/images/brand-editorial-3.jpg'],
    tailles: ['S', 'M', 'L', 'XL'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-f1-collection-femme-vol1',
    nom: 'Collection Femme Vol.1',
    prix: 79000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'NEW' as const,
    stock: 20,
    categorie: 'vetements',
    description: 'Premier opus de la collection femme WOG. Féminité assumée, coupe précise, coloris signature.',
    images: ['/images/prod-f1-main.jpg', '/images/prod-f1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-f2-collection-femme-vol2',
    nom: 'Collection Femme Vol.2',
    prix: 88000,
    prixOriginal: 110000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'SALE' as const,
    stock: 15,
    categorie: 'vetements',
    description: 'Volume II de la collection femme, silhouettes libres et structurées.',
    images: ['/images/wog-fem-1.jpg', '/images/prod-f2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-f3-edition-limitee-femme',
    nom: 'Édition Limitée Femme',
    prix: 118000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'EXCLUSIVE' as const,
    stock: 8,
    categorie: 'editions-limitees',
    description: 'Pièce exclusive de la collection femme, disponible en quantité très limitée.',
    images: ['/images/prod-f3-main.jpg', '/images/prod-f3-hover.jpg'],
    tailles: ['XS', 'S', 'M'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-editorial-1-unisex',
    nom: 'Drop Editorial — Unisexe',
    prix: 102000,
    marque: 'WOG Style',
    genre: 'UNISEXE' as const,
    statut: 'NEW' as const,
    stock: 30,
    categorie: 'vetements',
    description: 'Le drop éditorial unisexe WOG. Pour celles et ceux qui refusent les catégories.',
    images: ['/images/editorial-1.jpg', '/images/brand-editorial-1.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    collectionSlug: null as string | null,
  },
  {
    slug: 'wog-urban-style-unisex',
    nom: 'Urban Style — Mixte',
    prix: 65000,
    prixOriginal: 85000,
    marque: 'WOG Style',
    genre: 'UNISEXE' as const,
    statut: 'SALE' as const,
    stock: 40,
    categorie: 'vetements',
    description: 'Le streetwear WOG accessible à tous. Urban, libre, authentique.',
    images: ['/images/styleurb-1.jpg', '/images/unisex-1.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    collectionSlug: null as string | null,
  },
]

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const force = body.force === true

    const existingCount = await prisma.produit.count()
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        message: `Catalogue déjà initialisé (${existingCount} produits). Utilisez "Forcer la réinitialisation" pour tout recréer.`,
        seeded: false,
      })
    }

    // Réinitialisation forcée — suppression dans l'ordre des FK
    if (force) {
      await prisma.panierItem.deleteMany({})
      await prisma.ligneCommande.deleteMany({})
      await prisma.commande.deleteMany({})
      await prisma.produit.deleteMany({})
      await prisma.collection.deleteMany({})
    }

    // ── Upsert admin ──────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('WogStyle2026!', 12)
    await prisma.utilisateur.upsert({
      where: { email: 'admin@wog-style.com' },
      update: { motDePasse: adminHash, role: 'ADMIN', actif: true },
      create: {
        prenom: 'Admin',
        nom: 'WOG',
        email: 'admin@wog-style.com',
        motDePasse: adminHash,
        role: 'ADMIN',
      },
    })

    // ── Collections ───────────────────────────────────────────────────────────
    const collectionMap: Record<string, string> = {}
    for (const col of COLLECTIONS) {
      const c = await prisma.collection.upsert({
        where: { slug: col.slug },
        update: { nom: col.nom, description: col.description, imageUrl: col.imageUrl },
        create: col,
      })
      collectionMap[col.slug] = c.id
    }

    // ── Produits ──────────────────────────────────────────────────────────────
    let count = 0
    for (const p of WOG_PRODUCTS) {
      await prisma.produit.create({
        data: {
          slug: p.slug,
          nom: p.nom,
          description: p.description,
          prix: p.prix,
          prixOriginal: ('prixOriginal' in p ? p.prixOriginal : undefined) ?? null,
          marque: p.marque,
          genre: p.genre,
          statut: p.statut,
          stock: p.stock,
          categorie: p.categorie,
          actif: true,
          collectionId: p.collectionSlug ? (collectionMap[p.collectionSlug] ?? null) : null,
          images: {
            create: p.images.map((url, i) => ({ url, ordre: i, isHover: i === 1 })),
          },
          tailles: {
            create: p.tailles.map(label => ({
              label,
              stock: Math.floor(p.stock / p.tailles.length),
              disponible: true,
            })),
          },
        },
      })
      count++
    }

    return NextResponse.json({
      message: `✅ ${count} produits initialisés avec succès.`,
      admin: { email: 'admin@wog-style.com', motDePasse: 'WogStyle2026!' },
      seeded: true,
    })
  } catch (error) {
    console.error('[POST /api/admin/seed]', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'initialisation.' }, { status: 500 })
  }
}
