import { Suspense } from 'react'
import BoutiqueClient from './BoutiqueClient'

export const metadata = {
  title: 'Ma Boutique — WOG-STYLE',
  description: 'Découvrez toute la collection WOG-STYLE : vêtements homme, femme et unisexe.',
}

export default function BoutiquePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-end-black border-t-transparent rounded-full" />
      </div>
    }>
      <BoutiqueClient />
    </Suspense>
  )
}
