-- Migration 001 — URL images → MEDIUMTEXT
-- À exécuter UNE FOIS sur la base de production
--
-- Problème : VARCHAR(191) trop court pour stocker les images en base64
-- Fix      : MEDIUMTEXT (jusqu'à 16 Mo par image, largement suffisant)

ALTER TABLE `produit_images`
  MODIFY COLUMN `url` MEDIUMTEXT NOT NULL;

ALTER TABLE `collections`
  MODIFY COLUMN `imageUrl` MEDIUMTEXT NULL;
