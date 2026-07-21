-- Migration 002 — Collections éditoriales (façon GENÈSE)
-- À exécuter UNE FOIS sur la base de production
--
-- Ajoute la possibilité de créer, depuis le dashboard, des collections
-- avec hero + sous-collections (couleur, description, citation, galerie).

ALTER TABLE `collections`
  ADD COLUMN `tagline`    VARCHAR(255) NULL AFTER `nom`,
  ADD COLUMN `heroImage`  MEDIUMTEXT   NULL AFTER `imageUrl`,
  ADD COLUMN `hoverImage` MEDIUMTEXT   NULL AFTER `heroImage`;

CREATE TABLE IF NOT EXISTS `sous_collections` (
  `id`           VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `slug`         VARCHAR(191) NOT NULL,
  `nom`          VARCHAR(191) NOT NULL,
  `couleur`      VARCHAR(7)   NOT NULL DEFAULT '#000000',
  `description`  TEXT         NULL,
  `citation`     TEXT         NULL,
  `ordre`        INT          NOT NULL DEFAULT 0,
  `collectionId` VARCHAR(36)  NOT NULL,
  `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `sous_collections_collectionId_fkey` (`collectionId`),
  CONSTRAINT `sous_collections_collectionId_fkey`
    FOREIGN KEY (`collectionId`) REFERENCES `collections` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sous_collection_images` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `url`              MEDIUMTEXT   NOT NULL,
  `legende`          VARCHAR(255) NULL,
  `ordre`            INT          NOT NULL DEFAULT 0,
  `sousCollectionId` VARCHAR(36)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sous_collection_images_sousCollectionId_fkey` (`sousCollectionId`),
  CONSTRAINT `sous_collection_images_sousCollectionId_fkey`
    FOREIGN KEY (`sousCollectionId`) REFERENCES `sous_collections` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
