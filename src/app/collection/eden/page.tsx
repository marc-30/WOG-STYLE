import Link from 'next/link'
import SousCollectionGallery from '../genese/SousCollectionGallery'

export const metadata = {
  title: 'Collection EDEN — WOG STYLE',
  description: 'Deuxième collection WOG-STYLE. Des couleurs douces, des matières nobles, pour ceux qui cherchent l\'élégance naturelle.',
}

const sousCollections = [
  {
    id: 'champagne-royal',
    nom: 'CHAMPAGNE ROYAL',
    description: 'L\'élégance dans sa forme la plus pure. Des tons champagne et dorés qui subliment chaque silhouette avec raffinement et luminosité.',
    images: [
      { src: '/images/Collection EDEN/Champagne Royal-1.jpg', legende: 'Look 1' },
      { src: '/images/Collection EDEN/Champagne Royal-2.jpg', legende: 'Look 2' },
      { src: '/images/Collection EDEN/Champagne Royal-3.jpg', legende: 'Look 3' },
      { src: '/images/Collection EDEN/Champagne Royal-4.jpg', legende: 'Look 4' },
    ],
  },
  {
    id: 'ensemble-tabitha',
    nom: 'ENSEMBLE TABITHA II',
    description: 'Un ensemble structuré aux lignes épurées. Tabitha II incarne la femme contemporaine, affirmée dans ses choix, élégante dans chaque mouvement.',
    images: [
      { src: '/images/Collection EDEN/Ensemble Tabitha II.jpg', legende: 'Look Principal' },
      { src: '/images/Collection EDEN/Ensemble Tabitha II(1).jpg', legende: 'Look 2' },
      { src: '/images/Collection EDEN/Ensemble Tabitha II(2).jpg', legende: 'Look 3' },
      { src: '/images/Collection EDEN/Ensemble Tabitha II(3).jpg', legende: 'Look 4' },
      { src: '/images/Collection EDEN/Ensemble Tabitha II(4).jpg', legende: 'Look 5' },
    ],
  },
  {
    id: 'haut-warriors',
    nom: 'HAUT WARRIORS',
    description: 'Force et grâce. La pièce Warriors s\'impose comme le symbole d\'une génération qui n\'a pas peur d\'être vue. Coupes audacieuses, matières nobles.',
    images: [
      { src: '/images/Collection EDEN/Haut Warriors-1.jpg', legende: 'Look 1' },
      { src: '/images/Collection EDEN/Haut Warriors-2.jpg', legende: 'Look 2' },
      { src: '/images/Collection EDEN/Haut Warriors-3.jpg', legende: 'Look 3' },
      { src: '/images/Collection EDEN/Haut Warriors-4.jpg', legende: 'Look 4' },
      { src: '/images/Collection EDEN/Haut Warriors-5.jpg', legende: 'Look 5' },
    ],
  },
  {
    id: 'rubis',
    nom: 'RUBIS',
    description: 'La couleur du désir. Le Rubis WOG capture l\'intensité et la passion dans une pièce signature qui ne laisse personne indifférent.',
    images: [
      { src: '/images/Collection EDEN/Rubis-1.jpg', legende: 'Look 1' },
      { src: '/images/Collection EDEN/Rubis-2.jpg', legende: 'Look 2' },
      { src: '/images/Collection EDEN/Rubis-3.jpg', legende: 'Look 3' },
      { src: '/images/Collection EDEN/Rubis-4.jpg', legende: 'Look 4' },
    ],
  },
]

export default function EdenPage() {
  return (
    <main className="bg-end-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-end-black text-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-20 sm:py-28 flex flex-col items-center text-center gap-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
            Collection No. 02
          </p>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-none">
            EDEN
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
            Le paradis retrouvé. Des couleurs douces, des matières nobles, pour ceux qui cherchent l&apos;élégance naturelle.
          </p>
          <div className="w-12 h-px bg-white/30 mt-2" />
          <p className="text-xs uppercase tracking-widest text-white/40">
            Abidjan · Côte d&apos;Ivoire
          </p>
        </div>
      </section>

      {/* ── SOUS-COLLECTIONS ─────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24 space-y-24">
        {sousCollections.map((sc, index) => (
          <div key={sc.id} id={sc.id}>
            {/* En-tête sous-collection */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-end-gray-mid mb-2">
                  {String(index + 1).padStart(2, '0')} / {String(sousCollections.length).padStart(2, '0')}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-end-black">
                  {sc.nom}
                </h2>
              </div>
              <Link
                href={`/boutique?collection=eden`}
                className="text-xs font-bold uppercase tracking-widest text-end-black underline underline-offset-4 hover:opacity-60 transition-opacity flex-shrink-0"
              >
                Voir les produits →
              </Link>
            </div>

            {/* Description */}
            <p className="text-sm text-end-gray-dark leading-relaxed max-w-2xl mb-8">
              {sc.description}
            </p>

            {/* Galerie interactive */}
            <SousCollectionGallery name={sc.nom} images={sc.images} />

            {/* Séparateur */}
            {index < sousCollections.length - 1 && (
              <div className="mt-24 border-t border-end-gray-border" />
            )}
          </div>
        ))}
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="bg-end-black text-white">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 sm:py-20 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Découvrir la boutique
          </h2>
          <p className="text-sm text-white/60 max-w-md">
            Retrouvez toutes les pièces de la collection EDEN disponibles à l&apos;achat.
          </p>
          <Link
            href="/boutique?collection=eden"
            className="inline-flex items-center gap-2 bg-white text-end-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-end-gray-light transition-colors"
          >
            Voir tous les produits EDEN
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

    </main>
  )
}
