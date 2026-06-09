'use client'

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

    if (!identifiant || !motDePasse) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (tab === 'inscription' && (!prenom || !nom)) {
      setError('Veuillez renseigner votre prénom et nom.')
      return
    }

    setLoading(true)

    try {
      if (tab === 'connexion') {
        let connected = false

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
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prenom, nom,
            email: identifiantType === 'email' ? identifiant : undefined,
            telephone: identifiantType === 'telephone' ? identifiant : undefined,
            motDePasse,
          }),
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

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {open ? (
        <>
          <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        </>
      ) : (
        <>
          <path d="M1 9s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      )}
    </svg>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* ── IMAGE LATÉRALE (desktop) ── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/genese/emeraude-royale-2.jpg"
          alt="WOG-STYLE"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        <div className="absolute bottom-12 left-10">
          <Link href="/">
            <img src="/images/logo.jpg" alt="WOG-STYLE" className="w-14 h-14 object-contain mb-6" />
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Collection GENÈSE</p>
          <p className="text-2xl font-black uppercase text-white leading-tight max-w-xs">
            Rejoignez l'univers WOG-STYLE
          </p>
        </div>
      </div>

      {/* ── BANNIÈRE MOBILE (visible uniquement < lg) ── */}
      <div className="lg:hidden relative h-44 overflow-hidden flex-shrink-0">
        <img
          src="/images/genese/emeraude-royale-2.jpg"
          alt="WOG-STYLE"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 px-6">
          <Link href="/">
            <img src="/images/logo.jpg" alt="WOG-STYLE" className="w-12 h-12 object-contain rounded" />
          </Link>
          <p className="text-white font-black uppercase tracking-widest text-sm text-center">
            WOG-STYLE
          </p>
          <p className="text-white/70 text-xs uppercase tracking-wider text-center">
            {tab === 'connexion' ? 'Votre espace personnel' : 'Rejoignez la communauté'}
          </p>
        </div>
      </div>

      {/* ── FORMULAIRE ── */}
      <div className="flex-1 flex flex-col px-5 py-7 sm:px-8 lg:justify-center lg:px-16 xl:px-24">

        {/* En-tête (desktop uniquement — sur mobile c'est dans la bannière) */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-1">
            {tab === 'connexion' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-gray-500">
            {tab === 'connexion' ? 'Accédez à votre espace WOG-STYLE.' : 'Rejoignez la communauté WOG-STYLE.'}
          </p>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          {(['connexion', 'inscription'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                tab === t
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              {t === 'connexion' ? 'Se connecter' : 'Créer un compte'}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 w-full lg:max-w-sm">

          {/* Prénom + Nom (inscription) */}
          {tab === 'inscription' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="prenom" className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
                  Prénom
                </label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  autoComplete="given-name"
                  required
                  className="w-full border border-gray-300 px-3 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded-none"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
                  Nom
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  autoComplete="family-name"
                  required
                  className="w-full border border-gray-300 px-3 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded-none"
                  placeholder="Dupont"
                />
              </div>
            </div>
          )}

          {/* Sélecteur Email / Téléphone */}
          <div>
            <div className="flex border border-gray-300 mb-3">
              {(['email', 'telephone'] as IdentifiantType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setIdentifiantType(type)}
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    identifiantType === type
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-50'
                  }`}
                >
                  {type === 'email' ? 'Email' : 'Téléphone'}
                </button>
              ))}
            </div>
            <label htmlFor="identifiant" className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
              {identifiantType === 'email' ? 'Adresse email' : 'Numéro de téléphone'}
            </label>
            <input
              id="identifiant"
              type={identifiantType === 'email' ? 'email' : 'tel'}
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              autoComplete={identifiantType === 'email' ? 'email' : 'tel'}
              required
              className="w-full border border-gray-300 px-3 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded-none"
              placeholder={identifiantType === 'email' ? 'vous@exemple.com' : '+221 77 000 00 00'}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="motDePasse" className="text-xs font-semibold uppercase tracking-wider text-black">
                Mot de passe
              </label>
              {tab === 'connexion' && (
                <Link href="/mot-de-passe-oublie" className="text-xs text-gray-400 hover:text-black transition-colors">
                  Oublié ?
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
                className="w-full border border-gray-300 px-3 py-3 pr-11 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {tab === 'inscription' && (
              <p className="text-xs text-gray-400 mt-1">Minimum 8 caractères</p>
            )}
          </div>

          {/* Conditions CGU */}
          {tab === 'inscription' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-black flex-shrink-0" />
              <span className="text-xs text-gray-500 leading-relaxed">
                J'accepte les{' '}
                <Link href="/conditions" className="underline text-black">conditions d'utilisation</Link>
                {' '}et la{' '}
                <Link href="/confidentialite" className="underline text-black">politique de confidentialité</Link>.
              </span>
            </label>
          )}

          {/* Erreur */}
          {error && (
            <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded" role="alert">
              {error}
            </p>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-900 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Chargement...
              </>
            ) : tab === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        {/* Retour accueil */}
        <div className="mt-6 pb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-black transition-colors">
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
