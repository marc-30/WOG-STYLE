/**
 * Script de seed direct — exécuter avec : node seed-direct.mjs
 * Contourne l'API pour seeder directement la DB.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COLLECTIONS = [
  { slug: 'genese', nom: 'GENÈSE', description: 'Collection fondatrice de WOG-STYLE.', imageUrl: '/images/genese/emeraude-royale-1.jpg' },
  { slug: 'front-collection', nom: 'Front Collection', description: 'Les pièces phares WOG.', imageUrl: '/images/prod-h1-main.jpg' },
]

const WOG_PRODUCTS = [
  { slug: 'wog-h1-collection-black', nom: 'Collection Noire Homme Vol.1', prix: 85000, marque: 'WOG Style', genre: 'HOMME', statut: 'NEW', stock: 24, categorie: 'vetements', description: "Pièce signature de la collection homme WOG-STYLE.", images: ['/images/prod-h1-main.jpg', '/images/prod-h1-hover.jpg'], tailles: ['XS','S','M','L','XL','XXL'], col: null },
  { slug: 'wog-h2-collection-homme-vol2', nom: 'Collection Homme Vol.2', prix: 95000, marque: 'WOG Style', genre: 'HOMME', statut: 'EXCLUSIVE', stock: 18, categorie: 'vetements', description: 'Coupes audacieuses et matières nobles.', images: ['/images/prod-h2-main.jpg', '/images/prod-h2-hover.jpg'], tailles: ['XS','S','M','L','XL'], col: null },
  { slug: 'wog-h3-lookbook-homme', nom: 'Lookbook Homme — Pièce Phare', prix: 128000, marque: 'WOG Style', genre: 'HOMME', statut: 'NEW', stock: 10, categorie: 'vetements', description: 'La pièce phare du lookbook homme.', images: ['/images/prod-h3-main.jpg', '/images/prod-h3-hover.jpg'], tailles: ['S','M','L','XL'], col: null },
  { slug: 'wog-hom-signature', nom: 'WOG Signature — Homme', prix: 105000, marque: 'WOG Style', genre: 'HOMME', statut: 'STANDARD', stock: 22, categorie: 'vetements', description: 'La silhouette signature homme.', images: ['/images/wog-hom-1.jpg', '/images/prod-h2-hover.jpg'], tailles: ['XS','S','M','L','XL','XXL'], col: 'front-collection' },
  { slug: 'wog-vest-parf-homme', nom: 'Veste Parfaite — WOG Homme', prix: 147000, marque: 'WOG Style', genre: 'HOMME', statut: 'EXCLUSIVE', stock: 5, categorie: 'vetements', description: 'Pièce spéciale, finitions couture.', images: ['/images/vest-parf-1.jpg', '/images/brand-editorial-3.jpg'], tailles: ['S','M','L','XL'], col: null },
  { slug: 'wog-f1-collection-femme-vol1', nom: 'Collection Femme Vol.1', prix: 79000, marque: 'WOG Style', genre: 'FEMME', statut: 'NEW', stock: 20, categorie: 'vetements', description: 'Premier opus de la collection femme WOG.', images: ['/images/prod-f1-main.jpg', '/images/prod-f1-hover.jpg'], tailles: ['XS','S','M','L','XL'], col: null },
  { slug: 'wog-f2-collection-femme-vol2', nom: 'Collection Femme Vol.2', prix: 88000, prixOriginal: 110000, marque: 'WOG Style', genre: 'FEMME', statut: 'SALE', stock: 15, categorie: 'vetements', description: 'Volume II de la collection femme.', images: ['/images/wog-fem-1.jpg', '/images/prod-f2-hover.jpg'], tailles: ['XS','S','M','L'], col: null },
  { slug: 'wog-f3-edition-limitee-femme', nom: 'Édition Limitée Femme', prix: 118000, marque: 'WOG Style', genre: 'FEMME', statut: 'EXCLUSIVE', stock: 8, categorie: 'editions-limitees', description: 'Disponible en quantité très limitée.', images: ['/images/prod-f3-main.jpg', '/images/prod-f3-hover.jpg'], tailles: ['XS','S','M'], col: null },
  { slug: 'wog-fem-signature', nom: 'WOG Signature — Femme', prix: 97000, marque: 'WOG Style', genre: 'FEMME', statut: 'STANDARD', stock: 18, categorie: 'vetements', description: 'La silhouette signature femme.', images: ['/images/prod-f3-main.jpg', '/images/prod-f1-hover.jpg'], tailles: ['XS','S','M','L','XL'], col: 'front-collection' },
  { slug: 'wog-editorial-1-unisex', nom: 'Drop Editorial — Unisexe', prix: 102000, marque: 'WOG Style', genre: 'UNISEXE', statut: 'NEW', stock: 30, categorie: 'vetements', description: 'Pour celles et ceux qui refusent les catégories.', images: ['/images/editorial-1.jpg', '/images/brand-editorial-1.jpg'], tailles: ['XS','S','M','L','XL','XXL'], col: null },
  { slug: 'wog-marque-collection-brand1', nom: 'Collection Marque — Édition I', prix: 138000, prixOriginal: 165000, marque: 'WOG Style', genre: 'UNISEXE', statut: 'SALE', stock: 12, categorie: 'editions-limitees', description: 'Pièce de prestige, finitions haut de gamme.', images: ['/images/brand-editorial-1.jpg', '/images/brand-editorial-3.jpg'], tailles: ['S','M','L','XL'], col: null },
  { slug: 'wog-urban-style-unisex', nom: 'Urban Style — Mixte', prix: 65000, prixOriginal: 85000, marque: 'WOG Style', genre: 'UNISEXE', statut: 'SALE', stock: 40, categorie: 'vetements', description: 'Le streetwear WOG accessible à tous.', images: ['/images/styleurb-1.jpg', '/images/unisex-1.jpg'], tailles: ['XS','S','M','L','XL','XXL'], col: null },
  { slug: 'genese-aura-verte', nom: 'Aura Verte — GENÈSE', prix: 115000, marque: 'WOG Style', genre: 'UNISEXE', statut: 'EXCLUSIVE', stock: 15, categorie: 'editions-limitees', description: "Forêt et tons profonds. Connexion à la nature.", images: ['/images/genese/aura-verte-1.jpg', '/images/genese/aura-verte-2.jpg', '/images/genese/aura-verte-3.jpg'], tailles: ['XS','S','M','L','XL'], col: 'genese' },
  { slug: 'genese-bogolan-royal', nom: 'Bogolan Royal — GENÈSE', prix: 125000, marque: 'WOG Style', genre: 'HOMME', statut: 'EXCLUSIVE', stock: 10, categorie: 'editions-limitees', description: "Héritage textile africain revisité.", images: ['/images/genese/bogolan-royal-1.jpg', '/images/genese/bogolan-1.jpg', '/images/genese/bogolan-3.jpg'], tailles: ['S','M','L','XL'], col: 'genese' },
  { slug: 'genese-emeraude-royale', nom: 'Émeraude Royale — GENÈSE', prix: 135000, marque: 'WOG Style', genre: 'FEMME', statut: 'EXCLUSIVE', stock: 8, categorie: 'editions-limitees', description: "La pièce maîtresse de GENÈSE.", images: ['/images/genese/emeraude-royale-1.jpg', '/images/genese/emeraude-royale-2.jpg', '/images/genese/emeraude-royale-3.jpg'], tailles: ['XS','S','M'], col: 'genese' },
]

async function main() {
  console.log('Vérification...')
  const existing = await prisma.produit.count()
  if (existing > 0) {
    console.log(`DB déjà initialisée (${existing} produits). Abandon.`)
    return
  }

  console.log('Création des collections...')
  const colMap = {}
  for (const c of COLLECTIONS) {
    const col = await prisma.collection.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
    colMap[c.slug] = col.id
    console.log(' ✓', c.nom, '-', col.id)
  }

  console.log('Création des produits...')
  let count = 0
  for (const p of WOG_PRODUCTS) {
    await prisma.produit.create({
      data: {
        slug: p.slug,
        nom: p.nom,
        description: p.description,
        prix: p.prix,
        prixOriginal: p.prixOriginal ?? null,
        marque: p.marque,
        genre: p.genre,
        statut: p.statut,
        stock: p.stock,
        categorie: p.categorie,
        actif: true,
        collectionId: p.col ? colMap[p.col] : null,
        images: { create: p.images.map((url, i) => ({ url, ordre: i, isHover: i === 1 })) },
        tailles: { create: p.tailles.map(l => ({ label: l, stock: Math.floor(p.stock / p.tailles.length), disponible: true })) },
      },
    })
    count++
    console.log(` ✓ [${count}/${WOG_PRODUCTS.length}]`, p.nom)
  }

  console.log(`\n✅ ${count} produits créés avec succès !`)
}

main().catch(e => { console.error('ERREUR:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
