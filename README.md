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

# Upload images produits/collections — sans cette clé, écriture locale dans public/uploads/
BLOB_READ_WRITE_TOKEN=

# Email de notification de commande (resend.com/api-keys)
RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAIL=contact@wog-style.com

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

## Hébergement LWS (cPanel — app + base sur le même serveur)

L'app et la base tournent toutes les deux sur LWS (offre cPanel XL/XL2 ou supérieure —
Node.js géré via Passenger, versions disponibles jusqu'à v24). Aucune connexion MySQL
distante n'est nécessaire : `DB_HOST=localhost` fonctionne comme en local, puisque
l'app Node.js et MySQL sont sur le même serveur.

### 1. Base de données (cPanel → MySQL® Databases)

1. Créer une base + un utilisateur MySQL (cPanel préfixe avec le login : `monlogin_wog`)
2. Ajouter l'utilisateur à la base avec **toutes les permissions**
3. cPanel → **phpMyAdmin** → sélectionner la base → onglet **SQL** → coller le contenu
   de `schema.sql` → **Exécuter**

### 2. Déployer le code (cPanel → Software → Setup Node.js App)

1. **Create Application** :
   - Version Node.js : 20.x ou plus récente
   - Application root : ex. `wog-app` (⚠️ **hors** de `public_html`, contrairement au PHP)
   - Application startup file : `server.js` (fourni à la racine du projet, wrapper
     Next.js compatible Passenger — ne pas utiliser `next start` directement)
   - Application URL : le domaine ou sous-domaine cible
2. Déposer le code dans le dossier "Application root" — soit via **Git Version Control**
   (cPanel peut cloner directement le repo GitHub `marc-30/WOG-STYLE`), soit par upload
   manuel/FTP
3. Dans l'interface Setup Node.js App, remplir les **variables d'environnement** (mêmes
   clés que `.env.local`, avec `DB_HOST=localhost` et les identifiants MySQL créés à
   l'étape 1)
4. Cliquer **Run NPM Install**, puis lancer le build :
   ```bash
   # Depuis le terminal SSH cPanel, dans le dossier de l'app
   npm run build
   ```
5. Cliquer **Restart** pour démarrer l'application

### 3. Images

`BLOB_READ_WRITE_TOKEN` peut rester vide en prod LWS — l'upload écrit alors directement
dans `public/uploads/` sur le serveur (voir `src/app/api/admin/upload/route.ts`), ce qui
est le comportement voulu ici puisque l'app et le stockage sont sur la même machine.

Sources :
- [Comment déployer une application Node.js sur cPanel | LWS](https://aide.lws.fr/base/cPanel/Logiciels-et-programmation/Comment-utiliser-une-application-Nodejs-sur-un-hebergement-cPanel)
- [Node.js v24 sur cPanel LWS : guide de déploiement complet](https://tutoriels.lws.fr/divers/nodejs-cpanel)

---

## Licence

Projet WOG-STYLE — tous droits réservés.
