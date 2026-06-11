// Route upload conservée pour compatibilité future.
// Les images produits sont désormais compressées côté client (Canvas API)
// et stockées en base64 directement dans produit_images.url (MEDIUMTEXT).
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Utilisez le chargement direct depuis l\'appareil (compression client).' },
    { status: 410 }
  )
}
