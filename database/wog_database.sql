-- ============================================================
-- WOG-STYLE — Base de données MySQL
-- Compatible : MySQL 5.7+ / MariaDB 10.3+
-- Hébergeur  : LWS (phpMyAdmin)
-- Encodage   : utf8mb4 (emojis + caractères spéciaux)
-- Moteur     : InnoDB (transactions, clés étrangères)
--
-- IMPORT : phpmyadmin → onglet Importer → sélectionner ce fichier
--
-- COMPTES PAR DÉFAUT :
--   ADMIN  → admin@wog-style.com   / AdminWOG2026!
--   CLIENT → client@wog-style.com  / ClientTest123
--
-- ⚠ Adapter le nom de la base ci-dessous selon votre config LWS
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- ============================================================
-- CRÉATION DE LA BASE (adapter le nom si nécessaire)
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
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(100)    NOT NULL,
  `nom`           VARCHAR(200)    NOT NULL,
  `tagline`       VARCHAR(300)    DEFAULT NULL,
  `description`   TEXT            DEFAULT NULL,
  `image_cover`   VARCHAR(500)    DEFAULT NULL,
  `genre`         ENUM('HOMME','FEMME','UNISEXE','TOUS') NOT NULL DEFAULT 'TOUS',
  `statut`        ENUM('active','archivee','brouillon')  NOT NULL DEFAULT 'active',
  `ordre`         INT UNSIGNED    NOT NULL DEFAULT 0,
  `cree_le`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : utilisateurs
-- ============================================================
DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE `utilisateurs` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `prenom`        VARCHAR(100)    NOT NULL,
  `nom`           VARCHAR(100)    NOT NULL DEFAULT '',
  `email`         VARCHAR(255)    DEFAULT NULL,
  `telephone`     VARCHAR(30)     DEFAULT NULL,
  `mot_de_passe`  VARCHAR(255)    NOT NULL COMMENT 'Hash bcrypt rounds=10',
  `role`          ENUM('client','admin') NOT NULL DEFAULT 'client',
  `actif`         TINYINT(1)      NOT NULL DEFAULT 1,
  `cree_le`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email`     (`email`),
  UNIQUE KEY `uq_telephone` (`telephone`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : produits
-- ============================================================
DROP TABLE IF EXISTS `produits`;
CREATE TABLE `produits` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(200)    NOT NULL,
  `sku`           VARCHAR(100)    NOT NULL,
  `nom`           VARCHAR(300)    NOT NULL,
  `marque`        VARCHAR(100)    NOT NULL DEFAULT 'WOG Style',
  `description`   TEXT            DEFAULT NULL,
  `composition`   VARCHAR(500)    DEFAULT NULL,
  `prix`          INT UNSIGNED    NOT NULL COMMENT 'Prix en XOF',
  `prix_original` INT UNSIGNED    DEFAULT NULL COMMENT 'Prix avant remise en XOF',
  `genre`         ENUM('HOMME','FEMME','UNISEXE') NOT NULL DEFAULT 'UNISEXE',
  `categorie`     VARCHAR(100)    NOT NULL DEFAULT 'vetements',
  `couleur`       VARCHAR(100)    DEFAULT NULL,
  `statut`        ENUM('NEW','EXCLUSIVE','SALE','STANDARD','SOLD_OUT') NOT NULL DEFAULT 'STANDARD',
  `mis_en_avant`  TINYINT(1)      NOT NULL DEFAULT 0,
  `stock_total`   INT UNSIGNED    NOT NULL DEFAULT 0,
  `actif`         TINYINT(1)      NOT NULL DEFAULT 1,
  `collection_id` INT UNSIGNED    DEFAULT NULL,
  `cree_le`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  UNIQUE KEY `uq_sku`  (`sku`),
  KEY `idx_genre`       (`genre`),
  KEY `idx_statut`      (`statut`),
  KEY `idx_collection`  (`collection_id`),
  KEY `idx_mis_en_avant`(`mis_en_avant`),
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
  `largeur`    SMALLINT UNSIGNED DEFAULT NULL,
  `hauteur`    SMALLINT UNSIGNED DEFAULT NULL,
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
  `label`      VARCHAR(20)  NOT NULL COMMENT 'XS, S, M, L, XL, XXL',
  `valeur`     VARCHAR(20)  NOT NULL,
  `en_stock`   TINYINT(1)   NOT NULL DEFAULT 1,
  `quantite`   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_produit_taille` (`produit_id`, `valeur`),
  KEY `idx_produit` (`produit_id`),
  CONSTRAINT `fk_taille_produit`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : commandes
-- ============================================================
DROP TABLE IF EXISTS `commandes`;
CREATE TABLE `commandes` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference`        VARCHAR(50)  NOT NULL COMMENT 'Format : WOG-2026-XXXXX',
  `utilisateur_id`   INT UNSIGNED DEFAULT NULL,
  `prenom_client`    VARCHAR(100) NOT NULL,
  `nom_client`       VARCHAR(100) NOT NULL DEFAULT '',
  `email_client`     VARCHAR(255) DEFAULT NULL,
  `telephone_client` VARCHAR(30)  NOT NULL,
  `total_ttc`        INT UNSIGNED NOT NULL COMMENT 'Total en XOF',
  `frais_livraison`  INT UNSIGNED NOT NULL DEFAULT 0,
  `statut`           ENUM('en_attente','paye','en_preparation','expedie','livre','annule','rembourse')
                     NOT NULL DEFAULT 'en_attente',
  `methode_paiement` ENUM('carte','wave','orange_money','mtn_money','paypal','virement') NOT NULL,
  `statut_paiement`  ENUM('en_attente','confirme','echoue','rembourse') NOT NULL DEFAULT 'en_attente',
  `ville_livraison`  VARCHAR(100) DEFAULT NULL,
  `pays_livraison`   VARCHAR(100) NOT NULL DEFAULT 'Côte d''Ivoire',
  `adresse_livraison`TEXT         DEFAULT NULL,
  `note_client`      TEXT         DEFAULT NULL,
  `cree_le`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reference` (`reference`),
  KEY `idx_utilisateur`   (`utilisateur_id`),
  KEY `idx_statut`        (`statut`),
  KEY `idx_statut_paiement`(`statut_paiement`),
  KEY `idx_cree_le`       (`cree_le`),
  CONSTRAINT `fk_commande_utilisateur`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : commande_lignes
-- ============================================================
DROP TABLE IF EXISTS `commande_lignes`;
CREATE TABLE `commande_lignes` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `commande_id`   INT UNSIGNED  NOT NULL,
  `produit_id`    INT UNSIGNED  DEFAULT NULL,
  `nom_produit`   VARCHAR(300)  NOT NULL,
  `sku`           VARCHAR(100)  NOT NULL,
  `taille`        VARCHAR(20)   DEFAULT NULL,
  `couleur`       VARCHAR(100)  DEFAULT NULL,
  `quantite`      SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `prix_unitaire` INT UNSIGNED  NOT NULL COMMENT 'Prix au moment de la commande en XOF',
  `prix_total`    INT UNSIGNED  NOT NULL,
  `image_url`     VARCHAR(500)  DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_commande` (`commande_id`),
  KEY `idx_produit`  (`produit_id`),
  CONSTRAINT `fk_ligne_commande`
    FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ligne_produit`
    FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : visites (analytics)
-- ============================================================
DROP TABLE IF EXISTS `visites`;
CREATE TABLE `visites` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id`     VARCHAR(64)     NOT NULL,
  `utilisateur_id` INT UNSIGNED    DEFAULT NULL,
  `page`           VARCHAR(500)    NOT NULL,
  `referrer`       VARCHAR(500)    DEFAULT NULL,
  `user_agent`     VARCHAR(500)    DEFAULT NULL,
  `ip_adresse`     VARCHAR(45)     DEFAULT NULL,
  `pays`           VARCHAR(100)    DEFAULT NULL,
  `ville`          VARCHAR(100)    DEFAULT NULL,
  `visite_le`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session`  (`session_id`),
  KEY `idx_visite_le`(`visite_le`),
  KEY `idx_page`     (`page`(255)),
  CONSTRAINT `fk_visite_utilisateur`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : panier_sessions (paniers persistés)
-- ============================================================
DROP TABLE IF EXISTS `panier_sessions`;
CREATE TABLE `panier_sessions` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id`     VARCHAR(64)  NOT NULL,
  `utilisateur_id` INT UNSIGNED DEFAULT NULL,
  `donnees_json`   JSON         NOT NULL,
  `cree_le`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session` (`session_id`),
  KEY `idx_utilisateur` (`utilisateur_id`),
  CONSTRAINT `fk_panier_utilisateur`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DONNÉES : Collections
-- ============================================================
INSERT INTO `collections` (`slug`, `nom`, `tagline`, `description`, `image_cover`, `genre`, `statut`, `ordre`) VALUES
('genese',    'GENÈSE',    'L''origine. Le commencement.',     'Première collection WOG-STYLE. Retour aux sources, aux matières brutes, aux couleurs de la terre et de la forêt.',  '/images/genese/emeraude-royale-1.jpg', 'UNISEXE', 'active', 1),
('eden',      'EDEN',      'Le paradis retrouvé.',             'Deuxième collection WOG-STYLE. Des couleurs douces, des matières nobles, pour ceux qui cherchent l''élégance naturelle.', '/images/hero-1.jpg',                  'UNISEXE', 'active', 2),
('homme',     'WOG HOMME', 'L''homme moderne. Affirmé.',       'La ligne masculine WOG-STYLE : vêtements structurés, coupes précises et matières nobles.',                            '/images/prod-h3-main.jpg',            'HOMME',   'active', 3),
('femme',     'WOG FEMME', 'La femme contemporaine.',          'Silhouettes affirmées, matières sensibles et lignes épurées pour la femme qui incarne son style.',                    '/images/prod-f1-main.jpg',            'FEMME',   'active', 4);

-- ============================================================
-- DONNÉES : Utilisateurs (mots de passe hachés bcrypt rounds=10)
--
--   admin@wog-style.com  → AdminWOG2026!
--   client@wog-style.com → ClientTest123
-- ============================================================
INSERT INTO `utilisateurs` (`prenom`, `nom`, `email`, `telephone`, `mot_de_passe`, `role`) VALUES
('Admin', 'WOG',    'admin@wog-style.com',  NULL,            '$2b$10$wKXEHFreQyQMpOlTZuS1Ce3QcQLwJkazmJTijNbsjaYru.dF51TqG', 'admin'),
('Aminata', 'Diallo', 'client@wog-style.com', NULL,          '$2b$10$l7uNiPAFpglZqO6qtzgkiuHEKrvpZkDy43.DPNjMJCXjYSDbuRxE2', 'client'),
('Moussa', 'Traoré', NULL,                   '+225057539432', '$2b$10$aed7SVEt.Mm.EM3AVxJRHORVhgI2jrewy/7jatCvdalsED3tqlSH.', 'client');

-- ============================================================
-- VUES ANALYTIQUES
-- ============================================================
DROP VIEW IF EXISTS `ventes_par_jour`;
CREATE VIEW `ventes_par_jour` AS
  SELECT
    DATE(`cree_le`)   AS `jour`,
    COUNT(*)           AS `nb_commandes`,
    SUM(`total_ttc`)   AS `chiffre_affaires`
  FROM `commandes`
  WHERE `statut_paiement` = 'confirme'
  GROUP BY DATE(`cree_le`)
  ORDER BY `jour` DESC;

DROP VIEW IF EXISTS `top_produits`;
CREATE VIEW `top_produits` AS
  SELECT
    cl.`produit_id`,
    cl.`nom_produit`,
    SUM(cl.`quantite`)   AS `total_vendus`,
    SUM(cl.`prix_total`) AS `chiffre_affaires`
  FROM `commande_lignes` cl
  JOIN `commandes` c ON c.`id` = cl.`commande_id`
  WHERE c.`statut_paiement` = 'confirme'
  GROUP BY cl.`produit_id`, cl.`nom_produit`
  ORDER BY `total_vendus` DESC;

DROP VIEW IF EXISTS `ventes_par_ville`;
CREATE VIEW `ventes_par_ville` AS
  SELECT
    `ville_livraison`  AS `ville`,
    `pays_livraison`   AS `pays`,
    COUNT(*)            AS `nb_commandes`,
    SUM(`total_ttc`)    AS `chiffre_affaires`
  FROM `commandes`
  WHERE `statut_paiement` = 'confirme'
    AND `ville_livraison` IS NOT NULL
  GROUP BY `ville_livraison`, `pays_livraison`
  ORDER BY `nb_commandes` DESC;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- FIN DU FICHIER — wog_database.sql
-- ============================================================
