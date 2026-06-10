import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const identifiant = 'admin@wog-style.com'
const motDePasse = 'WogStyle2026!'

try {
  const user = await prisma.utilisateur.findFirst({
    where: { email: identifiant.toLowerCase() }
  })
  console.log('User trouvé:', user ? `${user.prenom} — role: ${user.role}` : 'AUCUN')

  if (user) {
    const ok = await bcrypt.compare(motDePasse, user.motDePasse)
    console.log('Mot de passe correct:', ok)
    console.log('Hash stocké:', user.motDePasse.substring(0, 20) + '...')
  }
} catch (e) {
  console.error('Erreur:', e.message)
} finally {
  await prisma.$disconnect()
}
