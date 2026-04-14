/**
 * @fichier next.config.js
 * @rôle Configuration de Next.js pour le projet END. Clothing Clone.
 *        Active les optimisations d'images, configure les domaines autorisés,
 *        et ajuste les paramètres de compilation.
 * @dépendances next
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Activation du mode strict React pour détecter les problèmes de cycle de vie */
  reactStrictMode: true,

  /* Configuration du composant next/image pour les domaines externes */
  images: {
    remotePatterns: [
      {
        /* Domaine placeholder pour les images de développement */
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        /* Images libres de droits Unsplash */
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  /* En-têtes de sécurité HTTP */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
