# WOG-STYLE — E-commerce Next.js 14

Boutique e-commerce mode haut de gamme pour la marque WOG-STYLE.
Collections africaines contemporaines, tableau de bord admin complet, paiement Stripe.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| Next.js 14 (App Router) | Framework full-stack |
| MySQL 8.0 + mysql2 | Base de données (SQL pur, sans ORM) |
| TypeScript | Typage statique |
| Tailwind CSS | Styles |
| Framer Motion | Animations |
| Headless UI | Composants accessibles |
| bcryptjs + jsonwebtoken | Authentification JWT |
| Zustand | Panier persisté (state global) |
| TanStack Query | Fetching / cache côté client |
| ApexCharts | Graphiques analytics |
| Stripe | Paiement par carte |

---

## Prérequis

- Node.js 18+
- MySQL 8.0+ (service local)
- npm

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos identifiants MySQL

# 3. Créer le schéma en base
mysql -u root -p < schema.sql

# 4. Lancer le serveur
npm run dev
```

---

## Variables d'environnement

Fichier `.env.local` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=wog_database
DB_PORT=3306

JWT_SECRET="votre-secret-jwt"
ADMIN_SETUP_KEY="wog-admin-setup-2026"

# Stripe (optionnel — paiement carte désactivé si absent)
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Compte admin & catalogue

Après avoir créé le schéma :

1. Connectez-vous sur `/connexion` avec votre compte
2. Appelez `POST /api/admin/seed` (ou via le bouton dans `/admin/produits`)

Compte admin par défaut après seed :

| Champ | Valeur |
|---|---|
| Email | admin@wog-style.com |
| Mot de passe | WogStyle2026! |

---

## Scripts

```bash
npm run dev      # Développement → http://localhost:3000
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```

---

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/             # login, register, me, logout
│   │   ├── admin/            # collections, produits, commandes,
│   │   │                     # utilisateurs, stats, analytics,
│   │   │                     # taches, postits, seed, setup
│   │   └── produits/         # catalogue public
│   ├── admin/                # Tableau de bord admin
│   ├── boutique/             # Catalogue produits
│   ├── connexion/            # Authentification
│   ├── panier/               # Panier
│   ├── paiement/             # Checkout
│   └── profil/               # Espace client
├── components/               # Composants réutilisables
├── lib/
│   ├── db.ts                 # Pool MySQL (mysql2/promise)
│   └── jwt.ts                # Helpers JWT
└── store/                    # Zustand stores
schema.sql                    # Schéma MySQL 8.0 complet
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Accueil |
| `/boutique` | Catalogue produits (filtres genre, collection) |
| `/boutique/[slug]` | Fiche produit |
| `/panier` | Panier |
| `/paiement` | Checkout (Stripe / Wave / Orange Money) |
| `/connexion` | Authentification |
| `/profil` | Espace client |
| `/admin` | Dashboard KPIs + graphiques |
| `/admin/produits` | CRUD produits |
| `/admin/collections` | Gestion collections |
| `/admin/commandes` | Gestion commandes |
| `/admin/utilisateurs` | Gestion clients |
| `/admin/crm` | Rapports analytics |
| `/admin/setup` | Création/promotion compte admin |

---

## API Routes

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion (email ou téléphone) |
| POST | `/api/auth/register` | Inscription |
| GET | `/api/auth/me` | Profil utilisateur connecté |
| POST | `/api/auth/logout` | Déconnexion |

### Boutique (public)
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/produits` | Catalogue (filtres : genre, statut, collection, slug) |

### Admin (JWT ADMIN requis)
| Méthode | Route | Description |
|---|---|---|
| GET / POST | `/api/admin/produits` | Liste / création |
| GET / PATCH / DELETE | `/api/admin/produits/[id]` | Détail / modification / suppression |
| GET / POST | `/api/admin/collections` | Liste / création |
| PATCH / DELETE | `/api/admin/collections/[id]` | Modification / suppression |
| GET / PATCH | `/api/admin/commandes` | Liste / mise à jour statut |
| GET / POST | `/api/admin/utilisateurs` | Liste / création |
| PATCH / DELETE | `/api/admin/utilisateurs/[id]` | Modification / suppression |
| GET / POST | `/api/admin/taches` | Liste / création |
| PATCH / DELETE | `/api/admin/taches/[id]` | Modification / suppression |
| GET / POST | `/api/admin/postits` | Liste / création |
| PATCH / DELETE | `/api/admin/postits/[id]` | Modification / suppression |
| GET | `/api/admin/stats` | KPIs (CA, commandes, clients, conversion) |
| GET | `/api/admin/analytics` | Graphiques ventes/clients (?period=6m/1y) |
| POST | `/api/admin/seed` | Initialiser le catalogue (16 produits + admin) |
| POST | `/api/admin/setup` | Créer ou promouvoir un compte admin |

---

## Schéma base de données

| Table | Description |
|---|---|
| `utilisateurs` | Comptes CLIENT / ADMIN |
| `collections` | Collections de vêtements |
| `produits` | Catalogue, prix en XOF |
| `produit_images` | Images par produit (ordonnées) |
| `produit_tailles` | Tailles + stock par taille |
| `commandes` | Commandes avec statut |
| `commande_lignes` | Lignes de commande |
| `panier_items` | Panier persisté en DB |
| `taches` | Tâches du tableau de bord |
| `postits` | Post-its du tableau de bord |

Statuts commande : `EN_ATTENTE` → `PAYE` → `EN_PREPARATION` → `EXPEDIE` → `LIVRE` / `ANNULE`

---

## Hébergement LWS

```bash
# 1. Exporter la base locale
mysqldump -u root -p wog_database > backup.sql

# 2. Importer sur LWS (phpMyAdmin ou SSH)
mysql -u user_lws -p nom_base_lws < backup.sql

# 3. Configurer .env en production
DB_HOST=mysql.lws.fr   # ou l'hôte fourni par LWS
DB_USER=user_lws
DB_PASSWORD=...
DB_NAME=nom_base_lws
DB_PORT=3306

# 4. Builder et démarrer
npm run build
npm run start  # ou configurer PM2
```

> Les images produits sont dans `/public/images/` — les uploader via FTP.

---

## Licence

Projet WOG-STYLE — tous droits réservés.
