-- Migration 001 — Agrandir les colonnes URL pour les images
-- À exécuter UNE FOIS sur la base de production (PlanetScale / LWS / etc.)
--
-- Problème : VARCHAR(191) trop court pour stocker des URLs Vercel Blob
-- Fix    : passer à TEXT (65 535 chars, largement suffisant)

ALTER TABLE `produit_images`
  MODIFY COLUMN `url` TEXT NOT NULL;

ALTER TABLE `collections`
  MODIFY COLUMN `imageUrl` TEXT NULL;
