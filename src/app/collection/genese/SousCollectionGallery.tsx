'use client'

import { useState } from 'react'

interface Image {
  src: string
  legende: string
}

interface Props {
  name: string
  images: Image[]
}

export default function SousCollectionGallery({ name, images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col sm:flex-row gap-3">

      {/* Grande image principale */}
      <div className="flex-1 relative bg-end-gray-light overflow-hidden" style={{ aspectRatio: '3/4', minHeight: '320px' }}>
        <img
          key={activeIndex}
          src={images[activeIndex].src}
          alt={`${name} — ${images[activeIndex].legende}`}
          className="absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-200"
        />
        {/* Légende sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-white">{name}</p>
          <p className="text-xs text-white/80 mt-0.5">{images[activeIndex].legende}</p>
        </div>
      </div>

      {/* Miniatures distinctes empilées */}
      <div className="flex sm:flex-col gap-2 sm:gap-3 sm:w-28">
        {images.map((img, i) => (
          <button
            key={i}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => setActiveIndex(i)}
            className={`relative flex-1 sm:flex-none overflow-hidden border-2 transition-all duration-150 ${
              activeIndex === i
                ? 'border-end-black opacity-100'
                : 'border-end-gray-border opacity-60 hover:opacity-90 hover:border-end-gray-dark'
            }`}
            style={{ aspectRatio: '3/4' }}
            aria-label={img.legende}
          >
            <img
              src={img.src}
              alt={img.legende}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Numéro du look */}
            <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5">
              <span className="text-white text-2xs font-bold">{i + 1}</span>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}
