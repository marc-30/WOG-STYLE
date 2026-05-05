'use client'

/**
 * @fichier app/connexion/ConnexionClient.tsx
 * @rôle Formulaire interactif de connexion / inscription WOG-STYLE.
 *       Onglets Connexion / Créer un compte.
 *       Champ identifiant = email ou numéro de téléphone.
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { simulerConnexion } from '@/data/test-accounts'
import { saveAuthUser } from '@/hooks/useAuth'

type Tab = 'connexion' | 'inscription'
type IdentifiantType = 'email' | 'telephone'

export const ConnexionClient: React.FC = () => {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('connexion')
  const [identifiantType, setIdentifiantType] = useState<IdentifiantType>('email')
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    /* Validation basique */
    if (!identifiant || !motDePasse) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (tab === 'inscription' && (!prenom || !nom)) {
      setError('Veuillez renseigner votre prénom et nom.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (tab === 'connexion') {
        let connected = false

        /* 1. Vraie API */
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifiant, motDePasse }),
          })

          if (res.ok) {
            const data = await res.json()
            saveAuthUser({ id: data.user.id, prenom: data.user.prenom, nom: data.user.nom, role: data.user.role.toLowerCase() as 'admin' | 'client' })
            router.push(data.user.role === 'ADMIN' ? '/admin' : '/profil')
            return
          }

          /* 2. Fallback comptes de test (dev local) */
          const compte = simulerConnexion(identifiant, motDePasse)
          if (compte) {
            saveAuthUser({ id: compte.id, prenom: compte.prenom, nom: compte.nom, role: compte.role })
            router.push(compte.role === 'admin' ? '/admin' : '/profil')
            connected = true
            return
          }

          const errData = await res.json().catch(() => ({}))
          setError(errData.error ?? 'Identifiant ou mot de passe incorrect.')
        } catch {
          /* 3. Fallback si API indisponible */
          const compte = simulerConnexion(identifiant, motDePasse)
          if (compte) {
            saveAuthUser({ id: compte.id, prenom: compte.prenom, nom: compte.nom, role: compte.role })
            router.push(compte.role === 'admin' ? '/admin' : '/profil')
            connected = true
            return
          }
          setError('Connexion impossible. Vérifiez votre réseau.')
        }

        if (!connected) return

      } else {
        /* Inscription */
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prenom, nom, email: identifiantType === 'email' ? identifiant : undefined, telephone: identifiantType === 'telephone' ? identifiant : undefined, motDePasse }),
        })

        if (res.ok) {
          const data = await res.json()
          saveAuthUser({ id: data.user.id, prenom: data.user.prenom, nom: data.user.nom, role: 'client' })
          router.push('/profil')
          return
        }

        const errData = await res.json().catch(() => ({}))
        setError(errData.error ?? 'Erreur lors de la création du compte.')
      }
    } finally {
      setLoading(false)
    }
  }

  /* Eye icon SVG */
  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {open ? (
        <>
          <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
        </>
      ) : (
        <>
          <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )

  return (
    <div className="min-h-screen bg-end-white flex">

      {/* ============================================================
          IMAGE LATÉRALE — moitié gauche (desktop)
          ============================================================ */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/genese/emeraude-royale-2.jpg"
          alt="WOG-STYLE — Collection GENÈSE"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />

        {/* Texte superposé sur l'image */}
        <div className="absolute bottom-12 left-10">
          <Link href="/" aria-label="WOG-STYLE — Accueil">
            <img
              src="/images/logo.jpg"
              alt="WOG-STYLE"
              className="w-14 h-14 object-contain mb-6"
            />
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-end-white/60 mb-2">
            Collection GENÈSE
          </p>
          <p className="text-2xl font-black uppercase text-end-white leading-tight max-w-xs">
            Rejoignez l'univers WOG-STYLE
          </p>
        </div>
      </div>

      {/* ============================================================
          FORMULAIRE — moitié droite
          ============================================================ */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">

        {/* Logo mobile */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <img src="/images/logo.jpg" alt="WOG-STYLE" className="w-12 h-12 object-contain" />
          </Link>
        </div>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-end-black mb-1">
            {tab === 'connexion' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-end-gray-mid">
            {tab === 'connexion'
              ? 'Accédez à votre espace WOG-STYLE.'
              : 'Rejoignez la communauté WOG-STYLE.'}
          </p>
        </div>

        {/* Onglets Connexion / Inscription */}
        <div className="flex border-b border-end-gray-border mb-8">
          <button
            type="button"
            onClick={() => { setTab('connexion'); setError('') }}
            className={`pb-3 mr-8 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              tab === 'connexion'
                ? 'border-end-black text-end-black'
                : 'border-transparent text-end-gray-mid hover:text-end-black'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => { setTab('inscription'); setError('') }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              tab === 'inscription'
                ? 'border-end-black text-end-black'
                : 'border-transparent text-end-gray-mid hover:text-end-black'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-sm">

          {/* Champs prénom/nom — inscription seulement */}
          {tab === 'inscription' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                  Prénom
                </label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  autoComplete="given-name"
                  required
                  className="w-full border border-end-gray-border px-4 py-3 text-sm text-end-black placeholder:text-end-gray-mid focus:outline-none focus:border-end-black transition-colors"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                  Nom
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  autoComplete="family-name"
                  required
                  className="w-full border border-end-gray-border px-4 py-3 text-sm text-end-black placeholder:text-end-gray-mid focus:outline-none focus:border-end-black transition-colors"
                  placeholder="Dupont"
                />
              </div>
            </div>
          )}

          {/* Sélecteur type d'identifiant */}
          <div>
            <div className="flex items-center gap-0 border border-end-gray-border mb-3">
              <button
                type="button"
                onClick={() => setIdentifiantType('email')}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  identifiantType === 'email'
                    ? 'bg-end-black text-end-white'
                    : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setIdentifiantType('telephone')}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  identifiantType === 'telephone'
                    ? 'bg-end-black text-end-white'
                    : 'text-end-black hover:bg-end-gray-light'
                }`}
              >
                Téléphone
              </button>
            </div>

            <label htmlFor="identifiant" className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
              {identifiantType === 'email' ? 'Adresse email' : 'Numéro de téléphone'}
            </label>
            <input
              id="identifiant"
              type={identifiantType === 'email' ? 'email' : 'tel'}
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              autoComplete={identifiantType === 'email' ? 'email' : 'tel'}
              required
              className="w-full border border-end-gray-border px-4 py-3 text-sm text-end-black placeholder:text-end-gray-mid focus:outline-none focus:border-end-black transition-colors"
              placeholder={identifiantType === 'email' ? 'vous@exemple.com' : '+221 77 000 00 00'}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="motDePasse" className="text-xs font-semibold uppercase tracking-wider text-end-black">
                Mot de passe
              </label>
              {tab === 'connexion' && (
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs text-end-gray-mid hover:text-end-black transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                id="motDePasse"
                type={showPassword ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete={tab === 'connexion' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                className="w-full border border-end-gray-border px-4 py-3 pr-12 text-sm text-end-black placeholder:text-end-gray-mid focus:outline-none focus:border-end-black transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-end-gray-mid hover:text-end-black transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {tab === 'inscription' && (
              <p className="text-xs text-end-gray-mid mt-1.5">
                Minimum 8 caractères
              </p>
            )}
          </div>

          {/* Conditions — inscription seulement */}
          {tab === 'inscription' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 accent-end-black" />
              <span className="text-xs text-end-gray-mid leading-relaxed">
                J'accepte les{' '}
                <Link href="/conditions" className="underline text-end-black hover:opacity-60">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="underline text-end-black hover:opacity-60">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>
          )}

          {/* Message d'erreur */}
          {error && (
            <p className="text-xs text-end-red font-semibold" role="alert">
              {error}
            </p>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-end-black text-end-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Chargement...
              </>
            ) : tab === 'connexion' ? (
              'Se connecter'
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {/* Retour accueil */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-end-gray-mid hover:text-end-black transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ConnexionClient
