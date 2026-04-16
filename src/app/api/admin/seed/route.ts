/**
 * POST /api/admin/seed — Initialise la DB avec les produits WOG depuis le JSON
 * À appeler une seule fois après le premier déploiement.
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

const WOG_PRODUCTS = [
  {
    slug: 'wog-h1-collection-black', nom: 'Collection Noire Homme Vol.1', sku: 'WOG-H1-001',
    prix: 85000, marque: 'WOG Style', genre: 'HOMME' as const, statut: 'NEW' as const, stock: 24,
    description: 'Pièce signature de la collection homme WOG-STYLE. Une silhouette élancée et structurée, pensée pour l\'homme contemporain qui revendique son style sans compromis.',
    images: ['/images/prod-h1-main.jpg', '/images/prod-h1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'wog-h2-collection-homme-vol2', nom: 'Collection Homme Vol.2', sku: 'WOG-H2-002',
    prix: 95000, marque: 'WOG Style', genre: 'HOMME' as const, statut: 'EXCLUSIVE' as const, stock: 18,
    description: 'Deuxième volet de la collection homme, avec des coupes plus audacieuses et des matières nobles.',
    images: ['/images/prod-h2-main.jpg', '/images/prod-h2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    slug: 'wog-h3-lookbook-homme', nom: 'Lookbook Homme — Pièce Phare', sku: 'WOG-H3-003',
    prix: 128000, marque: 'WOG Style', genre: 'HOMME' as const, statut: 'NEW' as const, stock: 10,
    description: 'La pièce phare du lookbook homme. Édition très limitée, assemblage artisanal.',
    images: ['/images/prod-h3-main.jpg', '/images/prod-h3-hover.jpg'],
    tailles: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'wog-f1-collection-femme-vol1', nom: 'Collection Femme Vol.1', sku: 'WOG-F1-001',
    prix: 79000, marque: 'WOG Style', genre: 'FEMME' as const, statut: 'NEW' as const, stock: 20,
    description: 'Premier opus de la collection femme WOG. Féminité assumée, coupe précise, coloris signature.',
    images: ['/images/prod-f1-main.jpg', '/images/prod-f1-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    slug: 'wog-f2-collection-femme-vol2', nom: 'Collection Femme Vol.2', sku: 'WOG-F2-002',
    prix: 88000, prixOriginal: 110000, marque: 'WOG Style', genre: 'FEMME' as const, statut: 'SALE' as const, stock: 15,
    description: 'Volume II de la collection femme, avec des silhouettes plus libres et structurées.',
    images: ['/images/prod-f2-main.jpg', '/images/prod-f2-hover.jpg'],
    tailles: ['XS', 'S', 'M', 'L'],
  },
  {
    slug: 'wog-f3-edition-limitee-femme', nom: 'Édition Limitée Femme', sku: 'WOG-F3-003',
    prix: 118000, marque: 'WOG Style', genre: 'FEMME' as const, statut: 'EXCLUSIVE' as const, stock: 8,
    description: 'Pièce exclusive de la collection femme, disponible en quantité très limitée.',
    images: ['/images/prod-f3-main.jpg', '/images/prod-f3-hover.jpg'],
    tailles: ['XS', 'S', 'M'],
  },
  {
    slug: 'wog-editorial-1-unisex', nom: 'Drop Editorial — Unisexe', sku: 'WOG-UNI-001',
    prix: 102000, marque: 'WOG Style', genre: 'UNISEXE' as const, statut: 'NEW' as const, stock: 30,
    description: 'Le drop éditorial unisexe WOG. Pour celles et ceux qui refusent les catégories.',
    images: ['/images/editorial-1.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'wog-marque-collection-brand1', nom: 'Collection Marque — Édition I', sku: 'WOG-MRQ-001',
    prix: 138000, prixOriginal: 165000, marque: 'WOG Style', genre: 'UNISEXE' as const, statut: 'SALE' as const, stock: 12,
    description: 'La première édition de la collection Marque. Pièce de prestige, finitions haut de gamme.',
    images: ['/images/brand-editorial-1.jpg', '/images/brand-editorial-3.jpg'],
    tailles: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'wog-front-hero-homme', nom: 'Front Collection — Homme Signature', sku: 'WOG-FH-001',
    prix: 105000, marque: 'WOG Style', genre: 'HOMME' as const, statut: 'STANDARD' as const, stock: 22,
    description: 'La silhouette signature homme de la collection Front. Intemporelle et impeccable.',
    images: ['/images/hero-1.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    slug: 'wog-front-hero-femme', nom: 'Front Collection — Femme Signature', sku: 'WOG-FF-001',
    prix: 97000, marque: 'WOG Style', genre: 'FEMME' as const, statut: 'STANDARD' as const, stock: 18,
    description: 'La silhouette signature femme de la collection Front. Élégance absolue.',
    images: ['/images/prod-f1-main.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    slug: 'wog-padre-drop-special', nom: 'Padre Drop — Pièce Spéciale', sku: 'WOG-PAD-001',
    prix: 147000, marque: 'WOG Style', genre: 'HOMME' as const, statut: 'EXCLUSIVE' as const, stock: 5,
    description: 'Pièce spéciale Padre Drop. En dehors des collections ordinaires.',
    images: ['/images/hero-2.jpg', '/images/brand-editorial-3.jpg'],
    tailles: ['S', 'M', 'L', 'XL'],
  },
  {
    slug: 'wog-slide-capsule-unisex', nom: 'Capsule Slide — Unisexe', sku: 'WOG-SLD-001',
    prix: 65000, prixOriginal: 85000, marque: 'WOG Style', genre: 'UNISEXE' as const, statut: 'SALE' as const, stock: 40,
    description: 'La capsule Slide, version unisexe. Le streetwear WOG accessible à tous.',
    images: ['/images/hero-2.jpg', '/images/editorial-1.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
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

    let count = 0
    for (const p of WOG_PRODUCTS) {
      await prisma.produit.create({
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
          actif: true,
          images: {
            create: p.images.map((url, i) => ({ url, ordre: i, isHover: i === 1 })),
          },
          tailles: {
            create: p.tailles.map(label => ({ label, stock: p.stock, disponible: true })),
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
