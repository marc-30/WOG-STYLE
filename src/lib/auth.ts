import { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE, type JwtPayload } from '@/lib/jwt'

/** Accès admin standard : ADMIN ou SUPER_ADMIN. */
export async function requireAdmin(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) return null
  return payload
}

/** Accès réservé à l'admin principal — gestion des comptes admin. */
export async function requireSuperAdmin(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'SUPER_ADMIN') return null
  return payload
}
