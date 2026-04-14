/**
 * POST /api/auth/logout
 * Déconnexion — supprime le cookie de session.
 */

import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/jwt'

export async function POST() {
  const response = NextResponse.json({ message: 'Déconnecté.' })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
