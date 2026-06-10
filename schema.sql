-- ============================================================
-- WOG-STYLE — Schéma MySQL 8.0
-- Compatible : MySQL 8.0.13+
-- Encodage   : utf8mb4
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `wog_database`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `wog_database`;

-- ── Utilisateurs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id`          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `prenom`      VARCHAR(191) NOT NULL,
  `nom`         VARCHAR(191) NOT NULL,
  `email`       VARCHAR(191) NULL,
  `telephone`   VARCHAR(191) NULL,
  `motDePasse`  VARCHAR(191) NOT NULL,
  `role`        ENUM('CLIENT','ADMIN') NOT NULL DEFAULT 'CLIENT',
  `actif`       TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateurs_email_key` (`email`),
  UNIQUE KEY `utilisateurs_telephone_key` (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Collections ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `collections` (
  `id`          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `slug`        VARCHAR(191) NOT NULL,
  `nom`         VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `imageUrl`    VARCHAR(191) NULL,
  `actif`       TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `collections_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Produits ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `produits` (
  `id`           VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `slug`         VARCHAR(191) NOT NULL,
  `nom`          VARCHAR(191) NOT NULL,
  `description`  TEXT         NULL,
  `prix`         INT          NOT NULL,
  `prixOriginal` INT          NULL,
  `marque`       VARCHAR(191) NOT NULL,
  `genre`        ENUM('HOMME','FEMME','UNISEXE') NOT NULL DEFAULT 'UNISEXE',
  `statut`       ENUM('STANDARD','NEW','EXCLUSIVE','SALE') NOT NULL DEFAULT 'STANDARD',
  `stock`        INT          NOT NULL DEFAULT 0,
  `actif`        TINYINT(1)   NOT NULL DEFAULT 1,
  `categorie`    VARCHAR(191) NOT NULL DEFAULT 'vetements',
  `collectionId` VARCHAR(36)  NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `produits_slug_key` (`slug`),
  KEY `produits_collectionId_fkey` (`collectionId`),
  CONSTRAINT `produits_collectionId_fkey`
    FOREIGN KEY (`collectionId`) REFERENCES `collections` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Images produits ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `produit_images` (
  `id`        VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `url`       VARCHAR(191) NOT NULL,
  `ordre`     INT          NOT NULL DEFAULT 0,
  `isHover`   TINYINT(1)   NOT NULL DEFAULT 0,
  `produitId` VARCHAR(36)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `produit_images_produitId_fkey` (`produitId`),
  CONSTRAINT `produit_images_produitId_fkey`
    FOREIGN KEY (`produitId`) REFERENCES `produits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tailles produits ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `produit_tailles` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `label`      VARCHAR(191) NOT NULL,
  `stock`      INT          NOT NULL DEFAULT 0,
  `disponible` TINYINT(1)   NOT NULL DEFAULT 1,
  `produitId`  VARCHAR(36)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `produit_tailles_produitId_fkey` (`produitId`),
  CONSTRAINT `produit_tailles_produitId_fkey`
    FOREIGN KEY (`produitId`) REFERENCES `produits` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Commandes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `commandes` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `reference`        VARCHAR(191) NOT NULL,
  `statut`           ENUM('EN_ATTENTE','PAYE','EN_PREPARATION','EXPEDIE','LIVRE','ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
  `methodePaiement`  VARCHAR(191) NOT NULL,
  `montantTotal`     INT          NOT NULL,
  `adresseLivraison` TEXT         NULL,
  `utilisateurId`    VARCHAR(36)  NOT NULL,
  `createdAt`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `commandes_reference_key` (`reference`),
  KEY `commandes_utilisateurId_fkey` (`utilisateurId`),
  CONSTRAINT `commandes_utilisateurId_fkey`
    FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs` (`id`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Lignes de commande ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `commande_lignes` (
  `id`           VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `quantite`     INT          NOT NULL,
  `prixUnitaire` INT          NOT NULL,
  `taille`       VARCHAR(191) NOT NULL,
  `commandeId`   VARCHAR(36)  NOT NULL,
  `produitId`    VARCHAR(36)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `commande_lignes_commandeId_fkey` (`commandeId`),
  KEY `commande_lignes_produitId_fkey` (`produitId`),
  CONSTRAINT `commande_lignes_commandeId_fkey`
    FOREIGN KEY (`commandeId`) REFERENCES `commandes` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commande_lignes_produitId_fkey`
    FOREIGN KEY (`produitId`) REFERENCES `produits` (`id`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tâches admin ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `taches` (
  `id`          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `titre`       VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `priorite`    ENUM('HAUTE','MOYENNE','BASSE') NOT NULL DEFAULT 'MOYENNE',
  `statut`      ENUM('A_FAIRE','EN_COURS','TERMINE') NOT NULL DEFAULT 'A_FAIRE',
  `echeance`    DATETIME(3)  NULL,
  `assignee`    VARCHAR(191) NULL,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Post-its admin ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `postits` (
  `id`        VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `contenu`   TEXT         NOT NULL,
  `couleur`   VARCHAR(191) NOT NULL DEFAULT 'yellow',
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Panier persisté ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `panier_items` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `quantite`      INT          NOT NULL DEFAULT 1,
  `taille`        VARCHAR(191) NOT NULL,
  `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `utilisateurId` VARCHAR(36)  NOT NULL,
  `produitId`     VARCHAR(36)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `panier_items_user_produit_taille` (`utilisateurId`, `produitId`, `taille`),
  KEY `panier_items_utilisateurId_fkey` (`utilisateurId`),
  KEY `panier_items_produitId_fkey` (`produitId`),
  CONSTRAINT `panier_items_utilisateurId_fkey`
    FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `panier_items_produitId_fkey`
    FOREIGN KEY (`produitId`) REFERENCES `produits` (`id`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
