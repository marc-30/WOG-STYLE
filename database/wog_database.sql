-- ============================================================
-- WOG-STYLE — Base de données MySQL
-- Compatible : MySQL 5.7+ / MariaDB 10.3+
-- Encodage   : utf8mb4
-- Moteur     : InnoDB
--
-- IMPORT : phpMyAdmin → Importer → sélectionner ce fichier
--
-- COMPTE ADMIN :
--   Email    : admin@wog-style.com
--   Mot de passe : WogStyle2026!
--
-- PRODUITS : 16 produits (EDEN × 4, GENÈSE × 4, autres × 8)
-- Toutes les images référencent des photos produits réelles.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- ============================================================
-- BASE DE DONNÉES
-- ============================================================
CREATE DATABASE IF NOT EXISTS `wog_database`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `wog_database`;

-- ============================================================
-- TABLE : collections
-- ============================================================
DROP TABLE IF EXISTS `collections`;
CREATE TABLE `collections` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(100) NOT NULL,
  `nom`           VARCHAR(200) NOT NULL,
  `tagline`       VARCHAR(300) DEFAULT NULL,
  `description`   TEXT         DEFAULT NULL,
  `image_cover`   VARCHAR(500) DEFAULT NULL,
  `genre`         ENUM('HOMME','FEMME','UNISEXE','TOUS') NOT NULL DEFAULT 'TOUS',
  `statut`        ENUM('active','archivee','brouillon')  NOT NULL DEFAULT 'active',
  `ordre`         INT UNSIGNED NOT NULL DEFAULT 0,
  `cree_le`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : utilisateurs
-- ============================================================
DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE `utilisateurs` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `prenom`        VARCHAR(100) NOT NULL,
  `nom`           VARCHAR(100) NOT NULL DEFAULT '',
  `email`         VARCHAR(255) DEFAULT NULL,
  `telephone`     VARCHAR(30)  DEFAULT NULL,
  `mot_de_passe`  VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt rounds=12',
  `role`          ENUM('client','admin') NOT NULL DEFAULT 'client',
  `actif`         TINYINT(1)   NOT NULL DEFAULT 1,
  `cree_le`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email`     (`email`),
  UNIQUE KEY `uq_telephone` (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : produits
-- ============================================================
DROP TABLE IF EXISTS `produits`;
CREATE TABLE `produits` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(200) NOT NULL,
  `sku`           VARCHAR(100) NOT NULL,
  `nom`           VARCHAR(300) NOT NULL,
  `marque`        VARCHAR(100) NOT NULL DEFAULT 'WOG Style',
  `description`   TEXT         DEFAULT NULL,
  `prix`          INT UNSIGNED NOT NULL COMMENT 'Prix en XOF',
  `prix_original` INT UNSIGNED DEFAULT NULL COMMENT 'Prix avant remise en XOF',
  `genre`         ENUM('HOMME','FEMME','UNISEXE') NOT NULL DEFAULT 'UNISEXE',
  `categorie`     VARCHAR(100) NOT NULL DEFAULT 'vetements',
  `statut`        ENUM('NEW','EXCLUSIVE','SALE','STANDARD','SOLD_OUT') NOT NULL DEFAULT 'STANDARD',
  `mis_en_avant`  TINYINT(1)   NOT NULL DEFAULT 0,
  `stock_total`   INT UNSIGNED NOT NULL DEFAULT 0,
  `actif`         TINYINT(1)   NOT NULL DEFAULT 1,
  `collection_id` INT UNSIGNED DEFAULT NULL,
  `cree_le`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  UNIQUE KEY `uq_sku`  (`sku`),
  KEY `idx_genre`      (`genre`),
  KEY `idx_statut`     (`statut`),
  KEY `idx_collection` (`collection_id`),
  CONSTRAINT `fk_produit_collection`
    FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : produit_images
-- ============================================================
DROP TABLE IF EXISTS `produit_images`;
CREATE TABLE `produit_images` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `produit_id` INT UNSIGNED NOT NULL,
  `url`        VARCHAR(500) NOT NULL,
  `alt`        VARCHAR(300) DEFAULT NULL,
  `type`       ENUM('principale','survol','galerie') NOT NULL DEFAULT 'galerie',
  `ordre`      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_produit` (`produit_id`),
  CONSTRAINT `fk_image_produit`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : produit_tailles
-- ============================================================
DROP TABLE IF EXISTS `produit_tailles`;
CREATE TABLE `produit_tailles` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `produit_id` INT UNSIGNED NOT NULL,
  `label`      VARCHAR(20)  NOT NULL,
  `en_stock`   TINYINT(1)   NOT NULL DEFAULT 1,
  `quantite`   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produit_taille` (`produit_id`, `label`),
  CONSTRAINT `fk_taille_produit`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : commandes
-- ============================================================
DROP TABLE IF EXISTS `commandes`;
CREATE TABLE `commandes` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference`        VARCHAR(50)  NOT NULL,
  `utilisateur_id`   INT UNSIGNED DEFAULT NULL,
  `prenom_client`    VARCHAR(100) NOT NULL,
  `nom_client`       VARCHAR(100) NOT NULL DEFAULT '',
  `email_client`     VARCHAR(255) DEFAULT NULL,
  `telephone_client` VARCHAR(30)  NOT NULL,
  `total_ttc`        INT UNSIGNED NOT NULL,
  `frais_livraison`  INT UNSIGNED NOT NULL DEFAULT 0,
  `statut`           ENUM('en_attente','paye','en_preparation','expedie','livre','annule') NOT NULL DEFAULT 'en_attente',
  `methode_paiement` ENUM('carte','wave','orange_money','mtn_money','virement') NOT NULL,
  `adresse_livraison`TEXT         DEFAULT NULL,
  `cree_le`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reference` (`reference`),
  KEY `idx_utilisateur` (`utilisateur_id`),
  CONSTRAINT `fk_commande_utilisateur`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : commande_lignes
-- ============================================================
DROP TABLE IF EXISTS `commande_lignes`;
CREATE TABLE `commande_lignes` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `commande_id`   INT UNSIGNED NOT NULL,
  `produit_id`    INT UNSIGNED DEFAULT NULL,
  `nom_produit`   VARCHAR(300) NOT NULL,
  `taille`        VARCHAR(20)  DEFAULT NULL,
  `quantite`      SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `prix_unitaire` INT UNSIGNED NOT NULL,
  `prix_total`    INT UNSIGNED NOT NULL,
  `image_url`     VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_commande` (`commande_id`),
  CONSTRAINT `fk_ligne_commande`
    FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ligne_produit`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DONNÉES : Collections (2 collections)
-- ============================================================
INSERT INTO `collections` (`id`, `slug`, `nom`, `tagline`, `description`, `image_cover`, `genre`, `statut`, `ordre`) VALUES
(1, 'genese', 'GENÈSE', 'L''origine. Le commencement.', 'Première collection WOG-STYLE. Retour aux sources, aux matières brutes, aux couleurs de la terre et de la forêt.', '/images/genese/emeraude-royale-1.jpg', 'UNISEXE', 'active', 1),
(2, 'eden',   'EDEN',   'Le paradis retrouvé.',         'EDEN — élégance, sensualité et raffinement. Des matières nobles pour ceux qui cherchent l''élégance naturelle.',      '/images/Collection%20EDEN/Champagne%20Royal-1.jpg', 'FEMME', 'active', 2);

-- ============================================================
-- DONNÉES : Utilisateur ADMIN uniquement
-- Mot de passe : WogStyle2026!  (bcrypt rounds=12)
-- ============================================================
INSERT INTO `utilisateurs` (`id`, `prenom`, `nom`, `email`, `telephone`, `mot_de_passe`, `role`, `actif`) VALUES
(1, 'Admin', 'WOG', 'admin@wog-style.com', NULL, '$2b$12$V21EAMJ3LD.q3xb242Q50.x7Poc9q1Zo04Y9uStWHvE3e45JsWS/C', 'admin', 1);

-- ============================================================
-- DONNÉES : Produits (16 produits)
-- ============================================================
INSERT INTO `produits` (`id`, `slug`, `sku`, `nom`, `marque`, `description`, `prix`, `prix_original`, `genre`, `categorie`, `statut`, `mis_en_avant`, `stock_total`, `actif`, `collection_id`) VALUES

-- ── Collection EDEN ──────────────────────────────────────────────────────────
(1,  'eden-champagne-royal',      'WOG-EDN-001', 'Champagne Royal',       'WOG Style', 'Champagne Royal — élégance et prestige. Une pièce sculpturale qui célèbre la féminité avec éclat.',      75000,  NULL,   'FEMME',   'editions-limitees', 'EXCLUSIVE', 1, 12, 1, 2),
(2,  'eden-ensemble-tabitha-ii',  'WOG-EDN-002', 'Ensemble Tabitha II',   'WOG Style', 'Ensemble Tabitha II — deux pièces pensées ensemble. Coupe moderne, tissu noble, allure irréprochable.', 85000,  NULL,   'FEMME',   'vetements',         'NEW',       1, 15, 1, 2),
(3,  'eden-haut-warriors',        'WOG-EDN-003', 'Haut Warriors',         'WOG Style', 'Haut Warriors — force et style. Un haut structuré qui affirme la personnalité avec audace.',            55000,  NULL,   'UNISEXE', 'vetements',         'NEW',       0, 20, 1, 2),
(4,  'eden-rubis',                'WOG-EDN-004', 'Rubis',                 'WOG Style', 'Rubis — la couleur du désir. Pièce précieuse aux finitions couture, disponible en quantité limitée.',   65000,  NULL,   'FEMME',   'editions-limitees', 'EXCLUSIVE', 1, 10, 1, 2),

-- ── Collection GENÈSE ────────────────────────────────────────────────────────
(5,  'genese-aura-verte',         'WOG-GNS-001', 'Aura Verte Harmonie',   'WOG Style', 'Forêt et tons profonds. L''Aura Verte incarne la connexion à la nature, traduite en tissu et en coupe.',  115000, NULL,   'UNISEXE', 'editions-limitees', 'EXCLUSIVE', 1, 15, 1, 1),
(6,  'genese-bogolan',            'WOG-GNS-002', 'Bogolan',               'WOG Style', 'Tissu bogolan authentique revisité par WOG. Racines africaines et modernité contemporaine.',             95000,  NULL,   'UNISEXE', 'editions-limitees', 'EXCLUSIVE', 0, 18, 1, 1),
(7,  'genese-bogolan-royal',      'WOG-GNS-003', 'Bogolan Royal',         'WOG Style', 'Héritage textile africain. Le Bogolan Royal rend hommage aux traditions ancestrales.',                  125000, NULL,   'HOMME',   'editions-limitees', 'EXCLUSIVE', 1, 10, 1, 1),
(8,  'genese-emeraude-royale',    'WOG-GNS-004', 'Émeraude Royale',       'WOG Style', 'Pièces précieuses et silhouettes sculptées. L''Émeraude Royale est la pièce maîtresse de GENÈSE.',       135000, NULL,   'FEMME',   'editions-limitees', 'EXCLUSIVE', 1,  8, 1, 1),

-- ── Pêle-mêle (sans collection) ──────────────────────────────────────────────
(9,  'wog-h1-collection-black',   'WOG-HOM-001', 'Collection Noire Homme Vol.1',    'WOG Style', 'Pièce signature de la collection homme WOG-STYLE. Silhouette élancée et structurée.',   85000, NULL,   'HOMME', 'vetements',         'NEW',       0, 24, 1, NULL),
(10, 'wog-h2-collection-vol2',    'WOG-HOM-002', 'Collection Homme Vol.2',          'WOG Style', 'Deuxième volet de la collection homme, coupes audacieuses et matières nobles.',          95000, NULL,   'HOMME', 'vetements',         'EXCLUSIVE', 0, 18, 1, NULL),
(11, 'wog-h3-lookbook-homme',     'WOG-HOM-003', 'Lookbook Homme — Pièce Phare',    'WOG Style', 'La pièce phare du lookbook homme. Édition très limitée, assemblage artisanal.',         128000, NULL,  'HOMME', 'vetements',         'NEW',       0, 10, 1, NULL),
(12, 'wog-hom-signature',         'WOG-HOM-004', 'WOG Signature — Homme',           'WOG Style', 'La silhouette signature homme. Intemporelle et impeccable.',                            105000, NULL,  'HOMME', 'vetements',         'STANDARD',  0, 22, 1, NULL),
(13, 'wog-vest-parf-homme',       'WOG-HOM-005', 'Veste Parfaite — WOG Homme',      'WOG Style', 'Pièce spéciale, confection exclusive, finitions couture.',                              147000, NULL,  'HOMME', 'vetements',         'EXCLUSIVE', 0,  5, 1, NULL),
(14, 'wog-f1-collection-femme',   'WOG-FEM-001', 'Collection Femme Vol.1',          'WOG Style', 'Premier opus de la collection femme WOG. Féminité assumée, coupe précise.',              79000, NULL,  'FEMME', 'vetements',         'NEW',       0, 20, 1, NULL),
(15, 'wog-f2-collection-femme-v2','WOG-FEM-002', 'Collection Femme Vol.2',          'WOG Style', 'Volume II de la collection femme, silhouettes libres et structurées.',                   88000, 110000,'FEMME', 'vetements',         'SALE',      0, 15, 1, NULL),
(16, 'wog-f3-edition-limitee',    'WOG-FEM-003', 'Édition Limitée Femme',           'WOG Style', 'Pièce exclusive de la collection femme, disponible en quantité très limitée.',          118000, NULL,  'FEMME', 'editions-limitees', 'EXCLUSIVE', 0,  8, 1, NULL);

-- ============================================================
-- DONNÉES : Images produits (photos réelles uniquement)
-- ============================================================
INSERT INTO `produit_images` (`produit_id`, `url`, `alt`, `type`, `ordre`) VALUES

-- Champagne Royal (4 photos)
(1, '/images/Collection%20EDEN/Champagne%20Royal-1.jpg', 'Champagne Royal — vue principale', 'principale', 0),
(1, '/images/Collection%20EDEN/Champagne%20Royal-2.jpg', 'Champagne Royal — vue 2',          'survol',     1),
(1, '/images/Collection%20EDEN/Champagne%20Royal-3.jpg', 'Champagne Royal — vue 3',          'galerie',    2),
(1, '/images/Collection%20EDEN/Champagne%20Royal-4.jpg', 'Champagne Royal — vue 4',          'galerie',    3),

-- Ensemble Tabitha II (4 photos)
(2, '/images/Collection%20EDEN/Ensemble%20Tabitha%20II.jpg',      'Ensemble Tabitha II — vue principale', 'principale', 0),
(2, '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%281%29.jpg','Ensemble Tabitha II — vue 2',          'survol',     1),
(2, '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%282%29.jpg','Ensemble Tabitha II — vue 3',          'galerie',    2),
(2, '/images/Collection%20EDEN/Ensemble%20Tabitha%20II%283%29.jpg','Ensemble Tabitha II — vue 4',          'galerie',    3),

-- Haut Warriors (5 photos)
(3, '/images/Collection%20EDEN/Haut%20Warriors-1.jpg', 'Haut Warriors — vue principale', 'principale', 0),
(3, '/images/Collection%20EDEN/Haut%20Warriors-2.jpg', 'Haut Warriors — vue 2',          'survol',     1),
(3, '/images/Collection%20EDEN/Haut%20Warriors-3.jpg', 'Haut Warriors — vue 3',          'galerie',    2),
(3, '/images/Collection%20EDEN/Haut%20Warriors-4.jpg', 'Haut Warriors — vue 4',          'galerie',    3),
(3, '/images/Collection%20EDEN/Haut%20Warriors-5.jpg', 'Haut Warriors — vue 5',          'galerie',    4),

-- Rubis (4 photos)
(4, '/images/Collection%20EDEN/Rubis-1.jpg', 'Rubis — vue principale', 'principale', 0),
(4, '/images/Collection%20EDEN/Rubis-2.jpg', 'Rubis — vue 2',          'survol',     1),
(4, '/images/Collection%20EDEN/Rubis-3.jpg', 'Rubis — vue 3',          'galerie',    2),
(4, '/images/Collection%20EDEN/Rubis-4.jpg', 'Rubis — vue 4',          'galerie',    3),

-- Aura Verte Harmonie (3 photos)
(5, '/images/genese/aura-verte-1.jpg', 'Aura Verte Harmonie — vue principale', 'principale', 0),
(5, '/images/genese/aura-verte-2.jpg', 'Aura Verte Harmonie — vue 2',          'survol',     1),
(5, '/images/genese/aura-verte-3.jpg', 'Aura Verte Harmonie — vue 3',          'galerie',    2),

-- Bogolan (2 photos)
(6, '/images/genese/bogolan-1.jpg', 'Bogolan — vue principale', 'principale', 0),
(6, '/images/genese/bogolan-3.jpg', 'Bogolan — vue 2',          'survol',     1),

-- Bogolan Royal (2 photos)
(7, '/images/genese/bogolan-royal-1.jpg', 'Bogolan Royal — vue principale', 'principale', 0),
(7, '/images/genese/bogolan-1.jpg',       'Bogolan Royal — vue 2',          'survol',     1),

-- Émeraude Royale (3 photos)
(8, '/images/genese/emeraude-royale-1.jpg', 'Émeraude Royale — vue principale', 'principale', 0),
(8, '/images/genese/emeraude-royale-2.jpg', 'Émeraude Royale — vue 2',          'survol',     1),
(8, '/images/genese/emeraude-royale-3.jpg', 'Émeraude Royale — vue 3',          'galerie',    2),

-- Collection Noire Homme Vol.1 (2 photos)
(9,  '/images/prod-h1-main.jpg',  'Collection Noire Homme Vol.1 — vue principale', 'principale', 0),
(9,  '/images/prod-h1-hover.jpg', 'Collection Noire Homme Vol.1 — vue survol',     'survol',     1),

-- Collection Homme Vol.2 (2 photos)
(10, '/images/prod-h2-main.jpg',  'Collection Homme Vol.2 — vue principale', 'principale', 0),
(10, '/images/prod-h2-hover.jpg', 'Collection Homme Vol.2 — vue survol',     'survol',     1),

-- Lookbook Homme (2 photos)
(11, '/images/prod-h3-main.jpg',  'Lookbook Homme — vue principale', 'principale', 0),
(11, '/images/prod-h3-hover.jpg', 'Lookbook Homme — vue survol',     'survol',     1),

-- WOG Signature Homme (1 photo)
(12, '/images/wog-hom-1.jpg', 'WOG Signature Homme — vue principale', 'principale', 0),

-- Veste Parfaite (1 photo produit uniquement)
(13, '/images/vest-parf-1.jpg', 'Veste Parfaite — vue principale', 'principale', 0),

-- Collection Femme Vol.1 (2 photos)
(14, '/images/prod-f1-main.jpg',  'Collection Femme Vol.1 — vue principale', 'principale', 0),
(14, '/images/prod-f1-hover.jpg', 'Collection Femme Vol.1 — vue survol',     'survol',     1),

-- Collection Femme Vol.2 (2 photos)
(15, '/images/wog-fem-1.jpg',     'Collection Femme Vol.2 — vue principale', 'principale', 0),
(15, '/images/prod-f2-hover.jpg', 'Collection Femme Vol.2 — vue survol',     'survol',     1),

-- Édition Limitée Femme (2 photos)
(16, '/images/prod-f3-main.jpg',  'Édition Limitée Femme — vue principale', 'principale', 0),
(16, '/images/prod-f3-hover.jpg', 'Édition Limitée Femme — vue survol',     'survol',     1);

-- ============================================================
-- DONNÉES : Tailles par produit
-- ============================================================
INSERT INTO `produit_tailles` (`produit_id`, `label`, `en_stock`, `quantite`) VALUES
-- EDEN Champagne Royal
(1,'XS',1,2),(1,'S',1,3),(1,'M',1,3),(1,'L',1,2),(1,'XL',1,2),
-- EDEN Ensemble Tabitha II
(2,'XS',1,3),(2,'S',1,3),(2,'M',1,3),(2,'L',1,3),(2,'XL',1,3),
-- EDEN Haut Warriors
(3,'XS',1,3),(3,'S',1,4),(3,'M',1,4),(3,'L',1,4),(3,'XL',1,3),(3,'XXL',1,2),
-- EDEN Rubis
(4,'XS',1,2),(4,'S',1,3),(4,'M',1,3),(4,'L',1,2),
-- GENÈSE Aura Verte Harmonie
(5,'XS',1,3),(5,'S',1,3),(5,'M',1,3),(5,'L',1,3),(5,'XL',1,3),
-- GENÈSE Bogolan
(6,'XS',1,3),(6,'S',1,3),(6,'M',1,3),(6,'L',1,3),(6,'XL',1,3),(6,'XXL',1,3),
-- GENÈSE Bogolan Royal
(7,'S',1,2),(7,'M',1,3),(7,'L',1,3),(7,'XL',1,2),
-- GENÈSE Émeraude Royale
(8,'XS',1,2),(8,'S',1,3),(8,'M',1,3),
-- Pêle-mêle Homme
(9,'XS',1,4),(9,'S',1,4),(9,'M',1,4),(9,'L',1,4),(9,'XL',1,4),(9,'XXL',1,4),
(10,'XS',1,3),(10,'S',1,3),(10,'M',1,4),(10,'L',1,4),(10,'XL',1,4),
(11,'S',1,2),(11,'M',1,3),(11,'L',1,3),(11,'XL',1,2),
(12,'XS',1,3),(12,'S',1,4),(12,'M',1,4),(12,'L',1,4),(12,'XL',1,4),(12,'XXL',1,3),
(13,'S',1,1),(13,'M',1,2),(13,'L',1,1),(13,'XL',1,1),
-- Pêle-mêle Femme
(14,'XS',1,4),(14,'S',1,4),(14,'M',1,4),(14,'L',1,4),(14,'XL',1,4),
(15,'XS',1,3),(15,'S',1,4),(15,'M',1,4),(15,'L',1,4),
(16,'XS',1,2),(16,'S',1,3),(16,'M',1,3);

-- ============================================================
-- VUES ANALYTIQUES
-- ============================================================
DROP VIEW IF EXISTS `ventes_par_jour`;
CREATE VIEW `ventes_par_jour` AS
  SELECT DATE(`cree_le`) AS `jour`, COUNT(*) AS `nb_commandes`, SUM(`total_ttc`) AS `chiffre_affaires`
  FROM `commandes`
  GROUP BY DATE(`cree_le`)
  ORDER BY `jour` DESC;

DROP VIEW IF EXISTS `top_produits`;
CREATE VIEW `top_produits` AS
  SELECT cl.`produit_id`, cl.`nom_produit`, SUM(cl.`quantite`) AS `total_vendus`, SUM(cl.`prix_total`) AS `chiffre_affaires`
  FROM `commande_lignes` cl
  GROUP BY cl.`produit_id`, cl.`nom_produit`
  ORDER BY `total_vendus` DESC;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- FIN — wog_database.sql (16 produits, 1 admin, 0 client)
-- ============================================================
