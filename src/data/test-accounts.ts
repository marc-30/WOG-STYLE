/**
 * @fichier data/test-accounts.ts
 * @rôle Comptes de simulation pour les tests locaux (sans base de données).
 *       À SUPPRIMER ou désactiver en production.
 *
 * COMPTES DISPONIBLES :
 * ─────────────────────────────────────────────────────────────
 *  ADMIN
 *    Email    : admin@wog-style.com
 *    Mot de passe : AdminWOG2024!
 *
 *  CLIENT 1 (connexion par email)
 *    Email    : client@wog-style.com
 *    Mot de passe : ClientTest123
 *
 *  CLIENT 2 (connexion par téléphone)
 *    Téléphone: +221770000000
 *    Mot de passe : MobileTest456
 * ─────────────────────────────────────────────────────────────
 */

export interface TestAccount {
  id: string
  prenom: string
  nom: string
  email?: string
  telephone?: string
  motDePasse: string
  role: 'admin' | 'client'
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    id: 'usr-admin-001',
    prenom: 'Admin',
    nom: 'WOG',
    email: 'admin@wog-style.com',
    motDePasse: 'AdminWOG2024!',
    role: 'admin',
  },
  {
    id: 'usr-client-001',
    prenom: 'Aminata',
    nom: 'Diallo',
    email: 'client@wog-style.com',
    motDePasse: 'ClientTest123',
    role: 'client',
  },
  {
    id: 'usr-client-002',
    prenom: 'Moussa',
    nom: 'Traoré',
    telephone: '+221770000000',
    motDePasse: 'MobileTest456',
    role: 'client',
  },
]

/**
 * Simule une authentification côté client pour les tests.
 * Vérifie l'identifiant (email ou téléphone) et le mot de passe.
 *
 * @returns Le compte trouvé, ou null si échec
 */
export function simulerConnexion(
  identifiant: string,
  motDePasse: string
): TestAccount | null {
  const compte = TEST_ACCOUNTS.find(
    (c) =>
      (c.email?.toLowerCase() === identifiant.toLowerCase() ||
        c.telephone === identifiant) &&
      c.motDePasse === motDePasse
  )
  return compte ?? null
}
