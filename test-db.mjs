import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
try {
  const u = await p.utilisateur.findFirst({ where: { email: 'admin@wog-style.com' } })
  console.log('USER TROUVÉ:', u ? `${u.prenom} ${u.nom} — ${u.role}` : 'AUCUN')
} catch (e) {
  console.error('ERREUR DB:', e.message)
} finally {
  await p.$disconnect()
}
