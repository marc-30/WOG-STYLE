/**
 * @fichier lib/jwt.ts
 * @rôle Utilitaires JWT — signature et vérification des tokens de session.
 *       Token stocké dans un cookie HttpOnly (sécurisé, inaccessible au JS).
 */

import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'wog-style-secret-change-in-prod'

export interface JwtPayload {
  id: string
  prenom: string
  nom: string
  email?: string
  telephone?: string
  role: 'CLIENT' | 'ADMIN'
}

/** Crée un JWT valide 7 jours */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

/** Vérifie et décode un JWT — retourne null si invalide/expiré */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload
  } catch {
    return null
  }
}

/** Nom du cookie de session */
export const SESSION_COOKIE = 'wog_session'
