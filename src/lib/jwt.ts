/**
 * @fichier lib/jwt.ts
 * @rôle Utilitaires JWT — signature et vérification des tokens de session.
 *       Token stocké dans un cookie HttpOnly (sécurisé, inaccessible au JS).
 */

import jwt from 'jsonwebtoken'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET non configurée')
  return secret
}

export interface JwtPayload {
  id: string
  prenom: string
  nom: string
  email?: string
  telephone?: string
  role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN'
}

/** Crée un JWT valide 7 jours */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

/** Vérifie et décode un JWT — retourne null si invalide/expiré */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload
  } catch {
    return null
  }
}

/** Nom du cookie de session */
export const SESSION_COOKIE = 'wog_session'
