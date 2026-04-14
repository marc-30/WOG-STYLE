'use client'

import React, { useState } from 'react'

export const ContactClient: React.FC = () => {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-end-white">

      {/* En-tête */}
      <section className="border-b border-end-gray-border py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-4">
          Nous sommes à votre écoute
        </p>
        <h1 className="text-4xl font-black uppercase text-end-black">Contact</h1>
      </section>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

          {/* Infos */}
          <div className="lg:col-span-2 space-y-10">
            {[
              {
                titre: 'Service client',
                lignes: ['contact@wog-style.com', 'Lun – Sam, 9h – 18h'],
              },
              {
                titre: 'Presse & collaborations',
                lignes: ['press@wog-style.com'],
              },
              {
                titre: 'Adresse',
                lignes: ['Dakar, Sénégal', "Afrique de l'Ouest"],
              },
              {
                titre: 'Téléphone',
                lignes: ['+221 77 000 00 00'],
              },
            ].map((info) => (
              <div key={info.titre}>
                <p className="text-xs font-bold uppercase tracking-widest text-end-black mb-3">
                  {info.titre}
                </p>
                {info.lignes.map((l) => (
                  <p key={l} className="text-sm text-end-gray-dark">{l}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M7 14l5 5 9-9" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-lg font-black uppercase text-end-black mb-2">Message envoyé</h2>
                <p className="text-sm text-end-gray-mid">Nous vous répondrons dans les 48h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {['Prénom', 'Nom'].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                        {label}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                    placeholder="vous@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                    Sujet
                  </label>
                  <select
                    required
                    className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors"
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option>Commande / Livraison</option>
                    <option>Retour / Échange</option>
                    <option>Question produit</option>
                    <option>Presse & collaboration</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-end-black mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full border border-end-gray-border px-4 py-3 text-sm focus:outline-none focus:border-end-black transition-colors resize-none"
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-end-black text-end-white py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Envoi...
                    </>
                  ) : (
                    'Envoyer le message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactClient
