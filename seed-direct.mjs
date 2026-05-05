/**
 * Seed direct — node seed-direct.mjs
 * Initialise collections, produits et admin WOG depuis les images réelles.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
  // ── Collection EDEN ──────────────────────────────────────────────────────
  {
    slug: 'eden-champagne-royal', nom: 'Champagne Royal', prix: 75000,
    marque: 'WOG Style', genre: 'FEMME', statut: 'EXCLUSIVE', stock: 12,
    categorie: 'editions-limitees',
    description: 'Champagne Royal — élégance et prestige. Une pièce sculpturale qui célèbre la féminité avec éclat.',
    images: [
      '/images/Collection%20EDEN/Champagne%20Royal-1.jpg',
      '/images/Collection%20EDEN/Champagne%20Royal-2.jpg',
      '/images/Collection%20EDEN/Champagne%20Royal-3.jpg',
      '/images/Collection%20EDEN/Champagne%20Royal-4.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], col: 'eden',
  },
  {
    slug: 'eden-ensemble-tabitha-ii', nom: 'Ensemble Tabitha II', prix: 85000,
    marque: 'WOG Style', genre: 'FEMME', statut: 'NEW', stock: 15,
    categorie: 'vetements',
    description: "Ensemble Tabitha II — deux pièces pensées ensemble. Coupe moderne, tissu noble, allure irréprochable.",
    images: [
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II.jpg',
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%281%29.jpg',
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%282%29.jpg',
      '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%283%29.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], col: 'eden',
  },
  {
    slug: 'eden-haut-warriors', nom: 'Haut Warriors', prix: 55000,
    marque: 'WOG Style', genre: 'UNISEXE', statut: 'NEW', stock: 20,
    categorie: 'vetements',
    description: 'Haut Warriors — force et style. Un haut structuré qui affirme la personnalité avec audace.',
    images: [
      '/images/Collection%20EDEN/Haut%20Warriors-1.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-2.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-3.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-4.jpg',
      '/images/Collection%20EDEN/Haut%20Warriors-5.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], col: 'eden',
  },
  {
    slug: 'eden-rubis', nom: 'Rubis', prix: 65000,
    marque: 'WOG Style', genre: 'FEMME', statut: 'EXCLUSIVE', stock: 10,
    categorie: 'editions-limitees',
    description: "Rubis — la couleur du désir. Pièce précieuse aux finitions couture, disponible en quantité limitée.",
    images: [
      '/images/Collection%20EDEN/Rubis-1.jpg',
      '/images/Collection%20EDEN/Rubis-2.jpg',
      '/images/Collection%20EDEN/Rubis-3.jpg',
      '/images/Collection%20EDEN/Rubis-4.jpg',
    ],
    tailles: ['XS', 'S', 'M', 'L'], col: 'eden',
  },

  // ── GENÈSE ───────────────────────────────────────────────────────────────
  {
    slug: 'genese-aura-verte', nom: 'Aura Verte Harmonie', prix: 115000,
    marque: 'WOG Style', genre: 'UNISEXE', statut: 'EXCLUSIVE', stock: 15,
    categorie: 'editions-limitees',
    description: "Forêt et tons profonds. L'Aura Verte incarne la connexion à la nature, traduite en tissu et en coupe.",
    images: ['/images/genese/aura-verte-1.jpg', '/images/genese/aura-verte-2.jpg', '/images/genese/aura-verte-3.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL'], col: 'genese',
  },
  {
    slug: 'genese-bogolan', nom: 'Bogolan', prix: 95000,
    marque: 'WOG Style', genre: 'UNISEXE', statut: 'EXCLUSIVE', stock: 18,
    categorie: 'editions-limitees',
    description: "Tissu bogolan authentique revisité par WOG. Racines africaines et modernité contemporaine.",
    images: ['/images/genese/bogolan-1.jpg', '/images/genese/bogolan-3.jpg'],
    tailles: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], col: 'genese',
  },
  {
    slug: 'genese-bogolan-royal', nom: 'Bogolan Royal', prix: 125000,
    marque: 'WOG Style', genre: 'HOMME', statut: 'EXCLUSIVE', stock: 10,
    categorie: 'editions-limitees',
    description: "Héritage textile africain. Le Bogolan Royal rend hommage aux traditions ancestrales avec une modernité absolue.",
    images: ['/images/genese/bogolan-royal-1.jpg', '/images/genese/bogolan-1.jpg'],
    tailles: ['S', 'M', 'L', 'XL'], col: 'genese',
  },
  {
    slug: 'genese-emeraude-royale', nom: 'Émeraude Royale', prix: 135000,
    marque: 'WOG Style', genre: 'FEMME', statut: 'EXCLUSIVE', stock: 8,
    categorie: 'editions-limitees',
    description: "Pièces précieuses et silhouettes sculptées. L'Émeraude Royale est la pièce maîtresse de GENÈSE.",
    images: ['/images/genese/emeraude-royale-1.jpg', '/images/genese/emeraude-royale-2.jpg', '/images/genese/emeraude-royale-3.jpg'],
    tailles: ['XS', 'S', 'M'], col: 'genese',
  },

  // ── Front Collection ─────────────────────────────────────────────────────
  { slug: 'wog-h1-collection-black', nom: 'Collection Noire Homme Vol.1', prix: 85000, marque: 'WOG Style', genre: 'HOMME', statut: 'NEW', stock: 24, categorie: 'vetements', description: "Pièce signature de la collection homme WOG-STYLE.", images: ['/images/prod-h1-main.jpg', '/images/prod-h1-hover.jpg'], tailles: ['XS','S','M','L','XL','XXL'], col: null },
  { slug: 'wog-h2-collection-homme-vol2', nom: 'Collection Homme Vol.2', prix: 95000, marque: 'WOG Style', genre: 'HOMME', statut: 'EXCLUSIVE', stock: 18, categorie: 'vetements', description: 'Deuxième volet de la collection homme.', images: ['/images/prod-h2-main.jpg', '/images/prod-h2-hover.jpg'], tailles: ['XS','S','M','L','XL'], col: null },
  { slug: 'wog-h3-lookbook-homme', nom: 'Lookbook Homme — Pièce Phare', prix: 128000, marque: 'WOG Style', genre: 'HOMME', statut: 'NEW', stock: 10, categorie: 'vetements', description: 'La pièce phare du lookbook homme.', images: ['/images/prod-h3-main.jpg', '/images/prod-h3-hover.jpg'], tailles: ['S','M','L','XL'], col: null },
  { slug: 'wog-hom-signature', nom: 'WOG Signature — Homme', prix: 105000, marque: 'WOG Style', genre: 'HOMME', statut: 'STANDARD', stock: 22, categorie: 'vetements', description: 'La silhouette signature homme.', images: ['/images/wog-hom-1.jpg', '/images/prod-h2-hover.jpg'], tailles: ['XS','S','M','L','XL','XXL'], col: 'front-collection' },
  { slug: 'wog-vest-parf-homme', nom: 'Veste Parfaite — WOG Homme', prix: 147000, marque: 'WOG Style', genre: 'HOMME', statut: 'EXCLUSIVE', stock: 5, categorie: 'vetements', description: 'Pièce spéciale, finitions couture.', images: ['/images/vest-parf-1.jpg'], tailles: ['S','M','L','XL'], col: null },
  { slug: 'wog-f1-collection-femme-vol1', nom: 'Collection Femme Vol.1', prix: 79000, marque: 'WOG Style', genre: 'FEMME', statut: 'NEW', stock: 20, categorie: 'vetements', description: 'Premier opus de la collection femme WOG.', images: ['/images/prod-f1-main.jpg', '/images/prod-f1-hover.jpg'], tailles: ['XS','S','M','L','XL'], col: null },
  { slug: 'wog-f2-collection-femme-vol2', nom: 'Collection Femme Vol.2', prix: 88000, prixOriginal: 110000, marque: 'WOG Style', genre: 'FEMME', statut: 'SALE', stock: 15, categorie: 'vetements', description: 'Volume II de la collection femme.', images: ['/images/wog-fem-1.jpg', '/images/prod-f2-hover.jpg'], tailles: ['XS','S','M','L'], col: null },
  { slug: 'wog-f3-edition-limitee-femme', nom: 'Édition Limitée Femme', prix: 118000, marque: 'WOG Style', genre: 'FEMME', statut: 'EXCLUSIVE', stock: 8, categorie: 'editions-limitees', description: 'Pièce exclusive, quantité très limitée.', images: ['/images/prod-f3-main.jpg', '/images/prod-f3-hover.jpg'], tailles: ['XS','S','M'], col: null },
]

async function main() {
  console.log('🌱 Démarrage du seed WOG...\n')

  // Admin
  console.log('Création du compte admin...')
  const hash = await bcrypt.hash('WogStyle2026!', 12)
  const adminUser = await prisma.utilisateur.upsert({
    where: { email: 'admin@wog-style.com' },
    update: { motDePasse: hash, role: 'ADMIN', actif: true },
    create: { prenom: 'Admin', nom: 'WOG', email: 'admin@wog-style.com', motDePasse: hash, role: 'ADMIN' },
  })
  // Supprimer tous les autres utilisateurs
  await prisma.panierItem.deleteMany({ where: { utilisateurId: { not: adminUser.id } } })
  const deleted = await prisma.utilisateur.deleteMany({ where: { id: { not: adminUser.id } } })
  if (deleted.count > 0) console.log(` ✓ ${deleted.count} utilisateur(s) non-admin supprimé(s)`)
  console.log(' ✓ admin@wog-style.com / WogStyle2026!\n')

  // Nettoyage si nécessaire
  const existing = await prisma.produit.count()
  if (existing > 0) {
    console.log(`${existing} produits existants — réinitialisation...`)
    await prisma.panierItem.deleteMany({})
    await prisma.ligneCommande.deleteMany({})
    await prisma.commande.deleteMany({})
    await prisma.produit.deleteMany({})
    await prisma.collection.deleteMany({})
    console.log(' ✓ Base nettoyée\n')
  }

  // Collections
  console.log('Création des collections...')
  const colMap = {}
  for (const c of COLLECTIONS) {
    const col = await prisma.collection.create({ data: c })
    colMap[c.slug] = col.id
    console.log(` ✓ ${c.nom}`)
  }

  // Produits
  console.log('\nCréation des produits...')
  let count = 0
  for (const p of WOG_PRODUCTS) {
    await prisma.produit.create({
      data: {
        slug: p.slug, nom: p.nom, description: p.description,
        prix: p.prix, prixOriginal: p.prixOriginal ?? null,
        marque: p.marque, genre: p.genre, statut: p.statut,
        stock: p.stock, categorie: p.categorie, actif: true,
        collectionId: p.col ? colMap[p.col] : null,
        images: { create: p.images.map((url, i) => ({ url, ordre: i, isHover: i === 1 })) },
        tailles: { create: p.tailles.map(l => ({ label: l, stock: Math.floor(p.stock / p.tailles.length), disponible: true })) },
      },
    })
    count++
    console.log(` ✓ [${count}/${WOG_PRODUCTS.length}] ${p.nom}`)
  }

  console.log(`\n✅ ${count} produits créés avec succès !`)
  console.log('📧 Admin : admin@wog-style.com')
  console.log('🔑 Mot de passe : WogStyle2026!')
}

main()
  .catch(e => { console.error('ERREUR:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
