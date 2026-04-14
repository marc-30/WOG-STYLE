/**
 * @fichier app/QueryProvider.tsx
 * @rôle Fournisseur React Query (TanStack Query) pour l'application.
 *        Doit être un Client Component car QueryClientProvider nécessite
 *        l'accès au contexte React disponible uniquement côté client.
 *        Instancie le QueryClient avec la configuration optimale pour END.
 * @dépendances @tanstack/react-query
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/* ============================================================
 * CONFIGURATION DU CLIENT REACT QUERY
 * ============================================================ */

/**
 * Crée une instance de QueryClient avec la configuration END. Clothing.
 *
 * @returns Instance configurée de QueryClient
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /* Durée pendant laquelle les données sont considérées fraîches (5 minutes) */
        staleTime: 5 * 60 * 1000,
        /* Pas de refetch automatique au focus de la fenêtre en développement */
        refetchOnWindowFocus: false,
        /* Nombre de tentatives en cas d'erreur */
        retry: 1,
      },
    },
  })
}

/* ============================================================
 * COMPOSANT FOURNISSEUR
 * ============================================================ */

/**
 * QueryProvider — fournisseur React Query pour l'application Next.js.
 *
 * Crée le QueryClient une seule fois par instance de composant
 * via useState pour éviter la création à chaque render.
 *
 * @param children - Composants enfants ayant accès au contexte React Query
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  /* Initialisation du client une seule fois grâce à useState */
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
