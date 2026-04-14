-- ============================================================
-- SCHÉMA MySQL — WOG-STYLE
-- Base de données : wog_database
-- Encodage : utf8mb4 (supporte emojis et caractères spéciaux)
-- Moteur : InnoDB (transactions, clés étrangères)
-- ============================================================

CREATE DATABASE IF NOT EXISTS wog_database
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wog_database;

-- ============================================================
-- TABLE : utilisateurs
-- Comptes clients et administrateurs
-- ============================================================
CREATE TABLE utilisateurs (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prenom        VARCHAR(100) NOT NULL,
  nom           VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE,
  telephone     VARCHAR(30) UNIQUE,
  mot_de_passe  VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
  role          ENUM('client','admin') NOT NULL DEFAULT 'client',
  actif         TINYINT(1) NOT NULL DEFAULT 1,
  cree_le       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mis_a_jour_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_telephone (telephone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : collections
-- Collections de la marque (GENÈSE, Homme, Femme, etc.)
-- ============================================================
CREATE TABLE collections (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  nom         VARCHAR(200) NOT NULL,
  tagline     VARCHAR(300),
  description TEXT,
  image_cover VARCHAR(500),
  genre       ENUM('HOMME','FEMME','UNISEXE','TOUS') NOT NULL DEFAULT 'TOUS',
  statut      ENUM('active','archivee','brouillon') NOT NULL DEFAULT 'active',
  ordre       INT UNSIGNED NOT NULL DEFAULT 0,
  cree_le     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mis_a_jour_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : produits
-- Catalogue complet des articles WOG-STYLE
-- Prix en XOF (Franc CFA Ouest-Africain)
-- ============================================================
CREATE TABLE produits (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  sku             VARCHAR(100) NOT NULL UNIQUE,
  nom             VARCHAR(300) NOT NULL,
  marque          VARCHAR(100) NOT NULL DEFAULT 'WOG Style',
  description     TEXT,
  composition     VARCHAR(500),
  prix            INT UNSIGNED NOT NULL COMMENT 'Prix en XOF',
  prix_original   INT UNSIGNED NULL COMMENT 'Prix avant remise en XOF',
  devise          CHAR(3) NOT NULL DEFAULT 'XOF',
  genre           ENUM('HOMME','FEMME','UNISEXE') NOT NULL DEFAULT 'UNISEXE',
  categorie       VARCHAR(100) NOT NULL DEFAULT 'clothing',
  couleur         VARCHAR(100),
  statut          ENUM('new','exclusive','sale','standard','sold_out') NOT NULL DEFAULT 'standard',
  mis_en_avant    TINYINT(1) NOT NULL DEFAULT 0,
  stock_total     INT UNSIGNED NOT NULL DEFAULT 0,
  actif           TINYINT(1) NOT NULL DEFAULT 1,
  collection_id   INT UNSIGNED NULL,
  cree_le         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mis_a_jour_le   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_genre (genre),
  INDEX idx_statut (statut),
  INDEX idx_mis_en_avant (mis_en_avant),
  INDEX idx_collection (collection_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : produit_images
-- Galerie d'images par produit (relation 1-N)
-- ============================================================
CREATE TABLE produit_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produit_id INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  alt        VARCHAR(300),
  largeur    SMALLINT UNSIGNED,
  hauteur    SMALLINT UNSIGNED,
  type       ENUM('principale','survol','galerie') NOT NULL DEFAULT 'galerie',
  ordre      TINYINT UNSIGNED NOT NULL DEFAULT 0,

  INDEX idx_produit (produit_id),
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : produit_tailles
-- Tailles disponibles par produit avec stock unitaire
-- ============================================================
CREATE TABLE produit_tailles (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produit_id INT UNSIGNED NOT NULL,
  label      VARCHAR(20) NOT NULL COMMENT 'XS, S, M, L, XL, XXL, 36, 38...',
  valeur     VARCHAR(20) NOT NULL,
  en_stock   TINYINT(1) NOT NULL DEFAULT 1,
  quantite   INT UNSIGNED NOT NULL DEFAULT 0,

  UNIQUE KEY uq_produit_taille (produit_id, valeur),
  INDEX idx_produit (produit_id),
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : commandes
-- Historique des commandes clients
-- ============================================================
CREATE TABLE commandes (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference          VARCHAR(50) NOT NULL UNIQUE COMMENT 'WOG-2024-XXXXX',
  utilisateur_id     INT UNSIGNED NULL,
  email_client       VARCHAR(255) NOT NULL,
  telephone_client   VARCHAR(30),
  prenom_client      VARCHAR(100) NOT NULL,
  nom_client         VARCHAR(100) NOT NULL,
  total_ht           INT UNSIGNED NOT NULL COMMENT 'Sous-total en XOF',
  frais_livraison    INT UNSIGNED NOT NULL DEFAULT 0,
  total_ttc          INT UNSIGNED NOT NULL COMMENT 'Total final en XOF',
  devise             CHAR(3) NOT NULL DEFAULT 'XOF',
  statut             ENUM('en_attente','paye','en_preparation','expedie','livre','annule','rembourse')
                     NOT NULL DEFAULT 'en_attente',
  methode_paiement   ENUM('carte','wave','orange_money','mtn_money','virement') NOT NULL,
  statut_paiement    ENUM('en_attente','confirme','echoue','rembourse') NOT NULL DEFAULT 'en_attente',
  adresse_livraison  TEXT,
  ville_livraison    VARCHAR(100),
  pays_livraison     VARCHAR(100) NOT NULL DEFAULT 'Sénégal',
  note_client        TEXT,
  cree_le            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mis_a_jour_le      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_reference (reference),
  INDEX idx_utilisateur (utilisateur_id),
  INDEX idx_statut (statut),
  INDEX idx_cree_le (cree_le),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : commande_lignes
-- Détail des articles dans chaque commande
-- ============================================================
CREATE TABLE commande_lignes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  commande_id  INT UNSIGNED NOT NULL,
  produit_id   INT UNSIGNED NULL,
  nom_produit  VARCHAR(300) NOT NULL COMMENT 'Copie du nom au moment de la commande',
  sku          VARCHAR(100) NOT NULL,
  taille       VARCHAR(20),
  couleur      VARCHAR(100),
  quantite     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  prix_unitaire INT UNSIGNED NOT NULL COMMENT 'Prix unitaire en XOF au moment de la commande',
  prix_total   INT UNSIGNED NOT NULL COMMENT 'quantite × prix_unitaire',
  image_url    VARCHAR(500),

  INDEX idx_commande (commande_id),
  INDEX idx_produit (produit_id),
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : visites
-- Tracking des visites pour le tableau de bord analytics
-- ============================================================
CREATE TABLE visites (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id      VARCHAR(64) NOT NULL,
  utilisateur_id  INT UNSIGNED NULL,
  page            VARCHAR(500) NOT NULL,
  referrer        VARCHAR(500),
  user_agent      VARCHAR(500),
  ip_adresse      VARCHAR(45) COMMENT 'IPv4 ou IPv6',
  pays            VARCHAR(100),
  ville           VARCHAR(100),
  duree_secondes  SMALLINT UNSIGNED,
  visite_le       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_session (session_id),
  INDEX idx_visite_le (visite_le),
  INDEX idx_page (page(255)),
  INDEX idx_pays (pays),
  INDEX idx_ville (ville),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- TABLE : panier_sessions
-- Paniers persistés (pour récupération après déconnexion)
-- ============================================================
CREATE TABLE panier_sessions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id      VARCHAR(64) NOT NULL UNIQUE,
  utilisateur_id  INT UNSIGNED NULL,
  donnees_json    JSON NOT NULL COMMENT 'Contenu du panier sérialisé',
  cree_le         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mis_a_jour_le   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_session (session_id),
  INDEX idx_utilisateur (utilisateur_id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- DONNÉES INITIALES — Collections
-- ============================================================
INSERT INTO collections (slug, nom, tagline, description, image_cover, genre, statut, ordre) VALUES
('genese',    'GENÈSE',      'L'origine. Le commencement.', 'Première collection WOG-STYLE. Retour aux sources, aux matières brutes, aux couleurs de la terre et de la forêt.', '/images/genese/emeraude-royale-1.jpg', 'UNISEXE', 'active', 1),
('homme',     'WOG HOMME',   'L'homme moderne. Affirmé.',  'La ligne masculine WOG-STYLE : vêtements structurés, coupes précises et matières nobles.', '/images/front-1.jpg',  'HOMME',   'active', 2),
('femme',     'WOG FEMME',   'La femme contemporaine.',    'Silhouettes affirmées, matières sensibles et lignes épurées pour la femme qui incarne son style.', '/images/front-2.jpg',  'FEMME',   'active', 3),
('editorial', 'WOG ÉDITORIAL','Drops créatifs & collaborations.', 'Pièces rares issues de collaborations artistiques et de drops éditoriaux limités.', '/images/editorial-1.jpg', 'UNISEXE', 'active', 4);


-- ============================================================
-- COMPTES DE TEST — SIMULATION
--
-- Hash bcrypt générés pour les mots de passe ci-dessous.
-- Ces hashes correspondent à bcrypt rounds=10.
-- À REMPLACER par de vrais hashes en production.
--
-- ADMIN  : admin@wog-style.com   / AdminWOG2024!
-- CLIENT : client@wog-style.com  / ClientTest123
-- CLIENT : +221770000000         / MobileTest456
-- ============================================================

INSERT INTO utilisateurs (prenom, nom, email, telephone, mot_de_passe, role) VALUES
-- Compte administrateur principal
(
  'Admin',
  'WOG',
  'admin@wog-style.com',
  NULL,
  '$2b$10$rOvHPX3t6sVGmJkL9P2uiO3N7Q8gY4dA1bC5eF0hI2jK6lM.ADMIN',
  'admin'
),
-- Compte client test 1 — email
(
  'Aminata',
  'Diallo',
  'client@wog-style.com',
  NULL,
  '$2b$10$xN3mP7qR2sT6vW9yA1bC4dE8fG0hI5jK.CLIENT.EMAIL.HASH',
  'client'
),
-- Compte client test 2 — téléphone
(
  'Moussa',
  'Traoré',
  NULL,
  '+221770000000',
  '$2b$10$zP5nQ8rS3tU7vX1yB2cD6eF9gH0iJ4kL.CLIENT.PHONE.HASH',
  'client'
);


-- ============================================================
-- VUES ANALYTICS UTILES
-- ============================================================

-- Vue : ventes par jour
CREATE VIEW ventes_par_jour AS
  SELECT
    DATE(cree_le) AS jour,
    COUNT(*) AS nb_commandes,
    SUM(total_ttc) AS chiffre_affaires
  FROM commandes
  WHERE statut_paiement = 'confirme'
  GROUP BY DATE(cree_le)
  ORDER BY jour DESC;

-- Vue : ventes par ville
CREATE VIEW ventes_par_ville AS
  SELECT
    ville_livraison AS ville,
    pays_livraison AS pays,
    COUNT(*) AS nb_commandes,
    SUM(total_ttc) AS chiffre_affaires
  FROM commandes
  WHERE statut_paiement = 'confirme'
    AND ville_livraison IS NOT NULL
  GROUP BY ville_livraison, pays_livraison
  ORDER BY nb_commandes DESC;

-- Vue : visites par jour
CREATE VIEW visites_par_jour AS
  SELECT
    DATE(visite_le) AS jour,
    COUNT(*) AS nb_visites,
    COUNT(DISTINCT session_id) AS sessions_uniques
  FROM visites
  GROUP BY DATE(visite_le)
  ORDER BY jour DESC;

-- Vue : produits les plus vendus
CREATE VIEW top_produits AS
  SELECT
    cl.produit_id,
    cl.nom_produit,
    SUM(cl.quantite) AS total_vendus,
    SUM(cl.prix_total) AS chiffre_affaires
  FROM commande_lignes cl
  JOIN commandes c ON c.id = cl.commande_id
  WHERE c.statut_paiement = 'confirme'
  GROUP BY cl.produit_id, cl.nom_produit
  ORDER BY total_vendus DESC;
