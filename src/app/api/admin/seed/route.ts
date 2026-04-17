/**
 * POST /api/admin/seed — Initialise la DB avec produits WOG + collections GENÈSE
 * À appeler depuis /admin/produits si le catalogue est vide.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

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
  // ── HOMME ──
  {
    slug: 'wog-h1-collection-black',
    nom: 'Collection Noire Homme Vol.1',
    prix: 85000,
    marque: 'WOG Style',
    genre: 'HOMME' as const,
    statut: 'NEW' as const,
    stock: 24,
    categorie: 'vetements',
    description: "Pièce signature de la collection homme WOG-STYLE. Silhouette élancée et structurée, pensée pour l'homme contemporain qui revendique son style sans compromis.",
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
    description: 'Deuxième volet de la collection homme, coupes plus audacieuses et matières nobles.',
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
  // ── FEMME ──
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
    slug: 'wog-fem-signature',
    nom: 'WOG Signature — Femme',
    prix: 97000,
    marque: 'WOG Style',
    genre: 'FEMME' as const,
    statut: 'STANDARD' as const,
    stock: 18,
    categorie: 'vetements',
    description: 'La silhouette signature femme. Élégance absolue, coupe sculpturale.',
    images: ['/images/prod-f3-main.jpg', '/images/prod-f1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
    collectionSlug: 'front-collection',
  },
  // ── UNISEXE ──
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
    slug: 'wog-marque-collection-brand1',
    nom: 'Collection Marque — Édition I',
    prix: 138000,
    prixOriginal: 165000,
    marque: 'WOG Style',
    genre: 'UNISEXE' as const,
    statut: 'SALE' as const,
    stock: 12,
    categorie: 'editions-limitees',
    description: 'La première édition de la collection Marque. Pièce de prestige, finitions haut de gamme.',
    images: ['/images/brand-editorial-1.jpg', '/images/brand-editorial-3.jpg'],
    tailles: ['S', 'M', 'L', 'XL'],
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
  // ── GENÈSE ──
  {
    slug: 'genese-aura-verte',
    nom: 'Aura Verte — GENÈSE',
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
    slug: 'genese-bogolan-royal',
    nom: 'Bogolan Royal — GENÈSE',
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
      '/images/genese/bogolan-3.jpg',
    ],
    tailles: ['S', 'M', 'L', 'XL'],
    collectionSlug: 'genese',
  },
  {
    slug: 'genese-emeraude-royale',
    nom: 'Émeraude Royale — GENÈSE',
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
]

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const existing = await prisma.produit.count()
    if (existing > 0) {
      return NextResponse.json({ message: `DB déjà initialisée (${existing} produits existants).`, seeded: false })
    }

    // 1. Créer les collections
    const collectionMap: Record<string, string> = {}
    for (const col of COLLECTIONS) {
      const c = await prisma.collection.upsert({
        where: { slug: col.slug },
        update: {},
        create: { slug: col.slug, nom: col.nom, description: col.description, imageUrl: col.imageUrl },
      })
      collectionMap[col.slug] = c.id
    }

    // 2. Créer les produits
    let count = 0
    for (const p of WOG_PRODUCTS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma.produit.create as any)({
        data: {
          slug: p.slug,
          nom: p.nom,
          description: p.description,
          prix: p.prix,
          prixOriginal: 'prixOriginal' in p ? (p as { prixOriginal?: number }).prixOriginal ?? null : null,
          marque: p.marque,
          genre: p.genre,
          statut: p.statut,
          stock: p.stock,
          categorie: p.categorie,
          actif: true,
          collectionId: p.collectionSlug ? collectionMap[p.collectionSlug] ?? null : null,
          images: {
            create: p.images.map((url, i) => ({ url, ordre: i, isHover: i === 1 })),
          },
          tailles: {
            create: p.tailles.map(label => ({ label, stock: Math.floor(p.stock / p.tailles.length), disponible: true })),
          },
        },
      })
      count++
    }

    return NextResponse.json({ message: `${count} produits initialisés avec succès.`, seeded: true })
  } catch (error) {
    console.error('[POST /api/admin/seed]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
