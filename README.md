# WOG-STYLE --- Plateforme E-Commerce Mode

Application e-commerce WOG-STYLE pour le marche africain (XOF, Wave / Orange Money / MTN / PayPal / Carte).

---

## Stack technique

| Technologie | Role |
|---|---|
| Next.js 14 | Framework React App Router |
| Prisma 5 + PostgreSQL | ORM + base de donnees Supabase |
| TypeScript | Typage statique |
| Tailwind CSS | Styles |
| ApexCharts | Graphiques analytics |
| bcryptjs + jsonwebtoken | Auth JWT |
| Zustand | Panier persiste |
| Framer Motion | Animations |

---

## Installation

```bash
cd WOG/wog-style
npm install
npx prisma db push
npx prisma generate
npm run dev
```

---

## Variables d environnement (.env)

```env
# OBLIGATOIRES
DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@db.ID.supabase.co:5432/postgres
ADMIN_SETUP_KEY=wog-admin-setup-2026

# OPTIONNELLES - Supabase Storage (upload images production)
# NEXT_PUBLIC_SUPABASE_URL=https://ID.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# OPTIONNELLES - Liens marchands paiement
# NEXT_PUBLIC_WAVE_MERCHANT_URL=https://pay.wave.com/m/VOTRE_ID
# NEXT_PUBLIC_ORANGE_MERCHANT_URL=https://merchant.orange-money.com/VOTRE_ID
# NEXT_PUBLIC_PAYPAL_MERCHANT_URL=https://www.paypal.me/VOTRE_COMPTE
```

---

## Premiere connexion admin

1. Creez un compte normal sur /connexion
2. Allez sur /admin/setup
3. Entrez email/telephone, mot de passe et ADMIN_SETUP_KEY
4. Votre compte est promu ADMIN

---

## Initialiser le catalogue

1. Allez sur /admin/produits
2. Cliquez Initialiser les produits WOG (visible si catalogue vide)
3. Les 12 produits WOG sont crees en DB

---

## Pages

| Route | Description |
|---|---|
| / | Accueil |
| /sneakers | Liste produits filtree |
| /product/[slug] | Fiche produit |
| /paiement | Wave / Orange / MTN / PayPal / Carte |
| /admin | Dashboard KPIs + graphiques |
| /admin/produits | CRUD produits + upload images |
| /admin/crm | Rapports et statistiques temps reel |
| /admin/commandes | Gestion commandes |
| /admin/utilisateurs | Gestion clients |
| /admin/setup | Creation compte admin |

---

## API Routes

| Route | Description |
|---|---|
| /api/auth/register, login, logout | Authentification |
| /api/produits | Catalogue public depuis DB |
| /api/commandes | Commandes client connecte |
| /api/admin/stats | KPIs dashboard |
| /api/admin/analytics | Donnees graphiques (?period=6m/1y) |
| /api/admin/commandes | Gestion commandes admin |
| /api/admin/produits + [id] | CRUD produits |
| /api/admin/taches + [id] | CRUD taches |
| /api/admin/postits + [id] | CRUD post-its |
| /api/admin/upload | Upload image multipart |
| /api/admin/seed | Init 12 produits WOG |
| /api/admin/setup | Cree ou promeut un admin |
| /api/admin/utilisateurs | Liste clients |

---

## Fonctionnalites cles

### Dashboard Admin (/admin)
- KPIs temps reel: CA total, commandes, clients, taux conversion (DB)
- Graphique ventes mensuel + nouveaux clients (ApexCharts barres)
- Objectif mensuel radial bar chart (cible 500 000 XOF)
- 8 commandes recentes avec statut colore
- Taches CRUD avec changement statut en 1 clic (DB)
- Post-its colores (DB)

### Produits (/admin/produits)
- Grille avec badges statut/genre/stock
- Creation et edition via modal: upload multi-images depuis galerie device
- Gestion des tailles avec stock par taille
- Recherche par nom, filtre par genre
- Auto-generation slug

### Upload images
- Supabase Storage si env vars configurees (production)
- Fallback local public/uploads/products/ (dev)
- Validation JPG/PNG/WebP max 5 MB

### Rapports (/admin/crm)
- 4 KPI cards avec tendances
- Graphique barres ventes kXOF + clients
- Donut chart repartition commandes par statut
- Top 5 produits par quantite vendue
- Toggle 6 mois / 1 an

### Paiement (/paiement)
- Wave: logo officiel + redirect marchand ou formulaire
- Orange Money: logo officiel + redirect ou formulaire
- MTN Money: formulaire telephone
- PayPal: logo officiel + redirect PayPal.me
- Carte: logos Visa/Mastercard

### Authentification
- JWT cookie HTTP-only wog_session
- Roles CLIENT / ADMIN
- Toutes routes /api/admin/* verifient role ADMIN

---

## Schema Prisma

| Modele | Description |
|---|---|
| Utilisateur | Comptes CLIENT/ADMIN |
| Produit | Catalogue prix XOF |
| ProduitImage | Images par produit |
| ProduitTaille | Tailles + stock |
| Commande | Commandes avec statut |
| CommandeLigne | Lignes commande |
| PanierItem | Panier DB |
| Tache | Taches dashboard |
| PostIt | Notes dashboard |

Statuts: EN_ATTENTE > PAYE > EN_PREPARATION > EXPEDIE > LIVRE / ANNULE

---

## Deploiement Vercel

```bash
vercel --prod
```

Variables Vercel obligatoires: DATABASE_URL, ADMIN_SETUP_KEY
Recommandees: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
Optionnelles: NEXT_PUBLIC_WAVE_MERCHANT_URL, NEXT_PUBLIC_ORANGE_MERCHANT_URL, NEXT_PUBLIC_PAYPAL_MERCHANT_URL

Apres deploiement: aller sur /admin/setup pour creer le compte admin.

---

## Bouton WhatsApp

Flottant sur toutes les pages --- +225 07 67 48 81 48

---

## Licence

Projet WOG-STYLE developpe a des fins de demonstration.
