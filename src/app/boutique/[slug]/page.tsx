import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import ProduitBoutiqueClient from './ProduitBoutiqueClient'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `${params.slug.replace(/-/g, ' ')} — WOG-STYLE Boutique`,
  }
}

export default function ProduitBoutiquePage({ params }: Props) {
  if (!params.slug) notFound()
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-8 h-8 border-2 border-end-black border-t-transparent rounded-full" />
      </div>
    }>
      <ProduitBoutiqueClient slug={params.slug} />
    </Suspense>
  )
}
