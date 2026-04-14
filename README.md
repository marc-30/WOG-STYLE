# WOG-STYLE — Plateforme E-Commerce Mode

> **W**earing **O**ur **G**roundedness — Mode contemporaine, drops exclusifs & éditions limitées.

Application e-commerce complète inspirée du design d'END. Clothing, entièrement rebrandée WOG-STYLE pour le marché africain (prix en XOF, paiements Wave / Orange Money / MTN Money + Stripe).

---

## Structure du projet

```
WOG/
├── front-wog/           # Application Next.js (frontend complet)
│   ├── src/
│   ├── public/
│   ├── database/        # Scripts SQL
│   └── ...
├── backend-wog/         # Base de données & API
│   └── database/
│       └── wog_database.sql
└── WOG-IMAGE/           # Images sources
```

> **Note :** Le dossier `front-wog/` peut encore s'appeler `wog-style/` si le renommage n'a pas encore été effectué. Lancez `renommer-front.bat` à la racine (VS Code fermé) pour finaliser la reorganisation.

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 14.2.x | Framework React — App Router (SSR + SSG + API Routes) |
| **React** | 18.3.x | Bibliothèque UI composants |
| **TypeScript** | 5.5.x | Typage statique strict |
| **Tailwind CSS** | 3.4.x | Styles utilitaires + design tokens custom |
| **Zustand** | 4.5.x | State management global (panier persisté) |
| **TanStack Query** | 5.x | Gestion des données asynchrones et cache |
| **Framer Motion** | 11.x | Animations et transitions fluides |
| **Stripe.js** | 4.x | Paiement par carte bancaire (mode TEST) |
| **@stripe/react-stripe-js** | 2.x | Composants React Stripe Elements |
| **stripe** (Node) | 16.x | SDK serveur pour créer les PaymentIntents |
| **Inter** (next/font) | — | Police principale chargée via Next.js |

---

## Prérequis

- **Node.js** >= 18.17.0
- **npm** >= 9.x
- Compte **Stripe** (optionnel — simulation locale sans clé)

```bash
node --version   # doit afficher v18.x ou supérieur
```

---

## Installation

```bash
# 1. Aller dans le dossier frontend
cd WOG/front-wog   # ou wog-style si pas encore renommé

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés Stripe TEST
```

### Sous Windows (si erreur PowerShell)

Doubles-cliquez sur `install.bat` dans le dossier `front-wog/`.

---

## Variables d'environnement

Fichier `.env.local` à créer à la racine de `front-wog/` :

```env
# Clé publique Stripe TEST (exposée côté client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Clé secrète Stripe TEST (serveur uniquement)
STRIPE_SECRET_KEY=sk_test_...
```

Récupérez vos clés sur [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys).

---

## Lancement

```bash
# Développement (hot reload)
npm run dev
# → http://localhost:3000

# Build de production
npm run build
npm run start

# Lint TypeScript + ESLint
npm run lint
```

Sous Windows, utilisez les fichiers `.bat` :
- `dev.bat` — démarre le serveur de développement
- `build.bat` — construit la version production
- `install.bat` — installe les dépendances

---

## Pages et routes

| Route | Type | Description |
|---|---|---|
| `/` | Page d'accueil | Hero, produits mis en avant, édito |
| `/sneakers` | Liste produits | Grille filtrée — sneakers & vêtements |
| `/product/[slug]` | Fiche produit | Galerie, tailles, ajout au panier |
| `/collection` | Collections | Vue 4 collections disponibles |
| `/collection/genese` | Collection GENÈSE | Présentation éditoriale + 3 sous-collections |
| `/collection/genese/aura-verte` | Sous-collection | Aura Verte — forêt et tons profonds |
| `/collection/genese/bogolan` | Sous-collection | Bogolan — héritage textile africain |
| `/collection/genese/emeraude-royale` | Sous-collection | Émeraude Royale — pièces précieuses |
| `/about` | À propos | Histoire de la marque, valeurs |
| `/contact` | Contact | Formulaire de contact |
| `/connexion` | Connexion | Login / inscription (simulation) |
| `/paiement` | Paiement | Stripe + Wave + Orange Money + MTN |
| `/admin` | Administration | Dashboard analytics, produits, collections |
| `/api/paiement/intent` | API Route | Crée un PaymentIntent Stripe (POST) |

---

## Fonctionnalités

### Navigation & Header
- Barre supérieure Homme / Femme avec bascule de genre
- Logo WOG-STYLE centré et cliquable
- Icône compte liée à `/connexion` (silhouette homme — sans texte)
- Barre de recherche avec suggestions simulées
- Header sticky qui se comprime au scroll
- Badge panier animé (Framer Motion)
- Mega-menu au survol avec délai anti-fermeture

### Page d'accueil
- Hero plein écran avec CTA
- Navigation rapide par catégorie (icônes)
- Grille 8 produits mis en avant
- Sections éditoriales collections
- Bande de réassurances (livraison, retours, authenticité)

### Liste produits (`/sneakers`)
- Filtres : marque, taille, couleur, fourchette de prix, genre
- 4 options de tri (nouveautés, prix croissant/décroissant, pertinence)
- Pagination infinie via IntersectionObserver
- Panel filtres desktop (sidebar fixe) + mobile (drawer bas de page)
- Compteur de résultats en temps réel
- Réinitialisation des filtres

### Fiche produit
- Galerie avec miniatures + zoom au survol
- Sélecteur de taille avec indication stock épuisé
- Bouton "Ajouter au panier" avec confirmation animée
- Accordéons : Description, Guide tailles, Livraison, Authenticité WOG-STYLE
- Produits similaires

### Panier
- Mini-panier drawer depuis la droite
- Ajout, suppression, modification quantité
- Total en XOF calculé en temps réel
- Livraison gratuite dès 50 000 XOF
- Persistance localStorage (Zustand persist)

### Paiement
- **Carte bancaire** — Stripe Elements (CardElement) mode TEST
- **Wave** — formulaire numéro + étapes interactives simulées
- **Orange Money** — formulaire numéro + étapes interactives simulées
- **MTN Money** — formulaire numéro + étapes interactives simulées
- Écran de succès avec confirmation

### Collections
- Page liste 4 collections en grille 2×2
- Page GENÈSE : hero plein écran + récit éditorial + 3 univers avec 9 images
- Grille produits associés

### Authentification (simulation frontend)
- Onglets Connexion / Inscription
- Toggle email / téléphone
- Affichage/masquage mot de passe
- Redirection admin → `/admin`, client → `/`

### Administration (`/admin`)
- Tableau de bord : KPIs (visites, commandes, CA, taux conversion)
- Graphiques barres SVG : visites journalières + achats
- Carte géographique vectorielle (simulation ventes par ville)
- Gestion produits : tableau CRUD + modal d'édition
- Gestion collections : cartes avec actions Voir / Modifier / Archiver

### Bouton WhatsApp flottant
- Visible sur toutes les pages (layout racine)
- Positionné en bas à droite (z-index 50)
- Tooltip animé au survol
- Lien direct WhatsApp : +225 07 67 48 81 48

---

## Comptes de test

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| **Administrateur** | `admin@wog-style.com` | `AdminWOG2024!` |
| **Client (email)** | `client@wog-style.com` | `ClientTest123` |
| **Client (téléphone)** | `+221770000000` | `MobileTest456` |

> Ces comptes sont simulés côté frontend (`src/data/test-accounts.ts`). Aucun backend requis pour les tester.

### Cartes de test Stripe

| Numéro | Résultat |
|---|---|
| `4242 4242 4242 4242` | Paiement accepté |
| `4000 0000 0000 0002` | Paiement refusé |
| `4000 0025 0000 3155` | Authentification 3D Secure |

Date d'expiration : toute date future · CVV : n'importe lequel (3 chiffres)

---

## Base de données

Le schéma SQL complet est dans `backend-wog/database/wog_database.sql`.

### Tables

| Table | Description |
|---|---|
| `utilisateurs` | Comptes clients et admins (bcrypt) |
| `collections` | Collections de la marque |
| `produits` | Catalogue produits (prix XOF) |
| `produit_images` | Galerie d'images par produit |
| `produit_tailles` | Tailles disponibles par produit |
| `commandes` | Commandes clients |
| `commande_lignes` | Lignes de commande (produit + taille + qté) |
| `visites` | Analytics visites par page |
| `panier_sessions` | Sessions panier anonymes |

### Vues SQL

| Vue | Description |
|---|---|
| `ventes_par_jour` | CA journalier |
| `ventes_par_ville` | CA par ville (géo analytics) |
| `visites_par_jour` | Trafic journalier |
| `top_produits` | Produits les plus vendus |

---

## Structure des fichiers source

```
src/
├── app/
│   ├── layout.tsx                    # Layout racine — Header, Footer, WhatsApp, MiniCart
│   ├── page.tsx                      # Page d'accueil
│   ├── HomeClient.tsx                # Client component accueil
│   ├── QueryProvider.tsx             # React Query provider
│   ├── api/
│   │   └── paiement/
│   │       └── intent/route.ts       # POST — crée un PaymentIntent Stripe
│   ├── admin/
│   │   ├── page.tsx
│   │   └── AdminClient.tsx           # Dashboard administration complet
│   ├── about/page.tsx                # À propos de WOG-STYLE
│   ├── collection/
│   │   ├── page.tsx                  # Liste des collections
│   │   └── genese/
│   │       ├── page.tsx              # Collection GENÈSE
│   │       ├── aura-verte/page.tsx
│   │       ├── bogolan/page.tsx
│   │       └── emeraude-royale/page.tsx
│   ├── connexion/
│   │   ├── page.tsx
│   │   └── ConnexionClient.tsx       # Login / inscription simulé
│   ├── contact/
│   │   ├── page.tsx
│   │   └── ContactClient.tsx
│   ├── paiement/
│   │   ├── page.tsx
│   │   └── PaiementClient.tsx        # Stripe + Mobile Money
│   ├── product/[slug]/
│   │   ├── page.tsx
│   │   └── ProductDetailClient.tsx
│   └── sneakers/
│       ├── page.tsx
│       └── SneakersClient.tsx
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Header sticky + mega-menu + compte → /connexion
│   │   ├── MegaMenu.tsx              # Mega-menu navigation
│   │   ├── Footer.tsx                # Footer 4 colonnes
│   │   └── MiniCart.tsx              # Drawer panier
│   ├── product/
│   │   ├── ProductCard.tsx           # Carte produit + hover + badge
│   │   ├── ProductGrid.tsx           # Grille avec scroll infini
│   │   ├── ProductGallery.tsx        # Galerie fiche produit
│   │   └── SizeSelector.tsx          # Sélecteur de taille
│   └── ui/
│       ├── Button.tsx
│       ├── Accordion.tsx
│       ├── Toast.tsx
│       ├── FilterPanel.tsx           # Filtres sidebar + drawer mobile
│       └── WhatsAppButton.tsx        # Bouton flottant WhatsApp
│
├── data/
│   ├── products.json                 # 12 produits WOG-STYLE (prix XOF)
│   ├── brands.json                   # Marques catalogue
│   └── test-accounts.ts             # Comptes de simulation login
│
├── hooks/
│   ├── useCart.ts
│   ├── useFilters.ts
│   └── useScrollHeader.ts
│
├── store/
│   └── cartStore.ts                  # Zustand — panier persisté localStorage
│
├── styles/
│   └── globals.css
│
└── types/
    └── index.ts                      # Interfaces TypeScript centralisées
```

---

## Design tokens Tailwind

Définis dans `tailwind.config.ts` :

| Token | Valeur | Usage |
|---|---|---|
| `end-black` | `#111111` | Couleur principale (texte, fond) |
| `end-white` | `#FFFFFF` | Fond clair |
| `end-gray-light` | `#F5F5F5` | Fond sections grises |
| `end-gray-border` | `#E5E5E5` | Bordures |
| `end-gray-mid` | `#9B9B9B` | Textes secondaires |
| `end-gray-dark` | `#555555` | Textes tertiaires |
| `end-red` | `#E53935` | Badges Sale, erreurs |

---

## Déploiement (Vercel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Ajouter les variables d'environnement dans le dashboard Vercel :
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

---

## Licence

Projet développé à des fins de démonstration et d'apprentissage.
WOG-STYLE est une marque créée pour ce projet.
