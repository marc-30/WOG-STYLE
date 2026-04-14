/**
 * @fichier app/about/page.tsx
 * @rôle Page "À propos" de WOG-STYLE.
 *       Histoire de la marque, valeurs, équipe créative, manifeste.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'À propos | WOG-STYLE',
  description:
    "Découvrez l'histoire et les valeurs de WOG-STYLE — une marque de mode contemporaine née en Afrique de l'Ouest, entre authenticité et créativité.",
}

export default function AboutPage() {
  return (
    <div>

      {/* ============================================================
          HERO — MANIFESTE
          ============================================================ */}
      <section
        className="relative w-full overflow-hidden bg-end-black"
        style={{ minHeight: '70vh' }}
      >
        <img
          src="/images/hero-1.jpg"
          alt="WOG-STYLE — À propos"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24">
          <p className="text-xs font-bold uppercase tracking-widest text-end-white/50 mb-6">
            Notre histoire
          </p>
          <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none text-end-white mb-8">
            WOG<br />STYLE
          </h1>
          <p className="text-base sm:text-lg text-end-white/70 max-w-xl leading-relaxed font-light">
            "Wear Our Generation — un style né de la rue, taillé pour l'avenir."
          </p>
        </div>
      </section>

      {/* ============================================================
          SECTION HISTOIRE
          ============================================================ */}
      <section className="bg-end-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
              <img
                src="/images/brand-editorial-1.jpg"
                alt="WOG-STYLE — Atelier créatif"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {/* Texte */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-6">
                2022 — Fondation
              </p>
              <h2 className="text-3xl font-black uppercase leading-tight text-end-black mb-8">
                Née dans les rues de Dakar,<br />portée par le monde.
              </h2>
              <div className="space-y-5 text-sm text-end-gray-dark leading-relaxed">
                <p>
                  WOG-STYLE est née d'un désir simple et radical : créer une mode qui parle à notre génération.
                  Une mode qui n'imite pas, qui n'emprunte pas — une mode qui crée.
                </p>
                <p>
                  Fondée à Dakar en 2022, la marque puise son inspiration dans la richesse des cultures
                  d'Afrique de l'Ouest, dans l'énergie des villes, dans les artisans et les créatifs qui
                  fabriquent le monde de demain.
                </p>
                <p>
                  Chaque pièce WOG-STYLE est pensée, dessinée et confectionnée avec intention.
                  Pas de fast fashion. Pas de compromis. Juste du style — authentique, assumé, libre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION VALEURS
          ============================================================ */}
      <section className="bg-end-gray-light py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-4">
              Ce en quoi nous croyons
            </p>
            <h2 className="text-3xl font-black uppercase leading-tight text-end-black">
              Nos valeurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                titre: 'Authenticité',
                texte:
                  "Chaque collection WOG-STYLE porte une histoire vraie. Nous ne faisons pas semblant. Nous créons depuis l'intérieur — depuis ce que nous vivons, voyons et ressentons.",
                icone: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 2L3 8v7c0 6 5 11 11 13 6-2 11-7 11-13V8L14 2Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 14l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                titre: 'Artisanat',
                texte:
                  "Nous travaillons avec des artisans locaux, des ateliers à taille humaine, des mains qui savent. Chaque couture, chaque détail est voulu et maîtrisé. La qualité n'est pas une option.",
                icone: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M7 21l4-4m0 0l8-8a2.83 2.83 0 10-4-4l-8 8m4 4l-4 1 1-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                titre: 'Liberté',
                texte:
                  "WOG-STYLE ne dicte pas. Elle propose. Nos pièces sont des outils d'expression personnelle — pour les hommes, les femmes, et tous ceux qui refusent les cases. Le style appartient à chacun.",
                icone: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 3v22M3 14h22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((valeur) => (
              <div key={valeur.titre} className="bg-end-white p-8">
                <div className="text-end-black mb-5">{valeur.icone}</div>
                <h3 className="text-sm font-black uppercase tracking-wider text-end-black mb-4">
                  {valeur.titre}
                </h3>
                <p className="text-sm text-end-gray-dark leading-relaxed">
                  {valeur.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION ÉDITORIALE IMAGE + TEXTE
          ============================================================ */}
      <section className="bg-end-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Grande image */}
          <div className="relative overflow-hidden" style={{ minHeight: '60vh' }}>
            <img
              src="/images/genese/emeraude-royale-1.jpg"
              alt="Collection GENÈSE"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* Texte */}
          <div className="flex flex-col justify-center p-12 lg:p-20 bg-end-black text-end-white">
            <p className="text-xs font-bold uppercase tracking-widest text-end-white/40 mb-6">
              Collection GENÈSE — 2024
            </p>
            <h2 className="text-3xl font-black uppercase leading-tight mb-8">
              L'origine de tout.
            </h2>
            <p className="text-sm text-end-white/70 leading-relaxed mb-10 max-w-md">
              GENÈSE est notre première collection. Elle pose les fondations de l'univers WOG-STYLE —
              matières nobles, couleurs de la terre et de la forêt, silhouettes intemporelles.
              C'est ici que tout a commencé.
            </p>
            <Link
              href="/collection/genese"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-end-white border-b border-end-white pb-0.5 w-fit hover:opacity-60 transition-opacity"
            >
              Explorer GENÈSE
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA FINAL
          ============================================================ */}
      <section className="bg-end-white py-20 text-center border-t border-end-gray-border">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-end-gray-mid mb-4">
            Rejoignez la communauté
          </p>
          <h2 className="text-3xl font-black uppercase text-end-black mb-6">
            Portez votre génération.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 bg-end-black text-end-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Voir les collections
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-end-gray-border text-end-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
