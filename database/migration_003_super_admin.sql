-- Migration 003 — Rôle SUPER_ADMIN
-- À exécuter UNE FOIS sur la base de production

ALTER TABLE `utilisateurs`
  MODIFY COLUMN `role` ENUM('CLIENT','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CLIENT';

-- Promouvoir le compte admin existant en admin principal (ajuster l'email si besoin) :
-- UPDATE utilisateurs SET role='SUPER_ADMIN' WHERE email='admin@wogstyle.com';
