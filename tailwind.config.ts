/**
 * @fichier tailwind.config.ts
 * @rôle Configuration Tailwind CSS personnalisée pour le clone END. Clothing.
 *        Définit les couleurs de marque, la typographie condensée, les espacements
 *        et les transitions spécifiques à l'identité visuelle d'END.
 * @dépendances tailwindcss
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      /* === PALETTE DE COULEURS END. CLOTHING ===
       * Le site END. repose sur une charte graphique minimaliste :
       * noir profond pour l'essentiel du texte et des éléments UI,
       * blanc pur pour les fonds, gris pour les séparateurs et textes secondaires.
       */
      colors: {
        /* Couleur principale : noir absolu, utilisé pour les textes titres et CTA */
        'end-black': '#000000',
        /* Blanc pur pour les arrière-plans de page et les cartes */
        'end-white': '#FFFFFF',
        /* Gris clair pour les bordures, séparateurs et fonds de filtres */
        'end-gray-light': '#F5F5F5',
        /* Gris moyen pour les textes secondaires (prix barré, descriptions) */
        'end-gray-mid': '#9B9B9B',
        /* Gris foncé pour les labels, breadcrumbs et textes de navigation */
        'end-gray-dark': '#4A4A4A',
        /* Gris de bordure, utilisé pour les séparateurs et contours de boutons */
        'end-gray-border': '#E0E0E0',
        /* Rouge vif pour les badges "Sale" et les prix soldés */
        'end-red': '#E53935',
        /* Bleu accent — boutons CTA, badges, barre top */
        'end-blue': '#3641f5',

        /* ── Dashboard admin tokens — thème noir ── */
        'brand-25': '#f5f5f5', 'brand-50': '#eeeeee', 'brand-100': '#e0e0e0',
        'brand-200': '#bdbdbd', 'brand-300': '#9e9e9e', 'brand-400': '#757575',
        'brand-500': '#212121', 'brand-600': '#000000', 'brand-700': '#000000',
        'brand-800': '#000000', 'brand-900': '#000000', 'brand-950': '#000000',
        'success-50': '#f0fdf4', 'success-100': '#dcfce7', 'success-400': '#4ade80',
        'success-500': '#22c55e', 'success-600': '#16a34a', 'success-700': '#15803d',
        'error-50': '#fef2f2', 'error-100': '#fee2e2', 'error-400': '#f87171',
        'error-500': '#ef4444', 'error-600': '#dc2626', 'error-700': '#b91c1c',
        'warning-50': '#fff7ed', 'warning-100': '#ffedd5', 'warning-400': '#fb923c',
        'warning-500': '#f97316', 'warning-600': '#ea580c',
        'blue-light-50': '#f0f9ff', 'blue-light-100': '#e0f2fe', 'blue-light-200': '#b9e6fe',
        'blue-light-400': '#36bffa', 'blue-light-500': '#0ba5ec', 'blue-light-600': '#0086c9',
        'gray-dark': '#101828',
        /* Fond du header et du footer : noir quasi-pur */
        'end-header': '#111111',
        /* Couleur d'accentuation légère pour les survols */
        'end-hover': '#1A1A1A',
      },

      /* === TYPOGRAPHIE ===
       * END. utilise une police sans-serif condensée pour les titres
       * et une police sans-serif classique pour le corps du texte.
       * On utilise "Inter" comme substitut web de la police condensée propriétaire.
       */
      fontFamily: {
        /* Police principale pour le corps du texte */
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        /* Police condensée pour les titres, badges et éléments marquants */
        condensed: ['Inter', 'Arial Narrow', 'sans-serif'],
        /* Police monospace pour les références produit */
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },

      /* === TAILLES DE POLICE ===
       * Système typographique cohérent avec les proportions du site END.
       */
      fontSize: {
        'theme-xs': ['0.75rem', { lineHeight: '1.125rem' }],
        'theme-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'theme-xl': ['1.25rem', { lineHeight: '1.875rem' }],
        'title-sm': ['1.875rem', { lineHeight: '2.375rem' }],
        /* Micro-texte : mentions légales, labels de filtres */
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        /* Petit texte : descriptions secondaires, métadonnées */
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        /* Texte standard : corps et labels */
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        /* Texte de base : paragraphes */
        base: ['1rem', { lineHeight: '1.5rem' }],
        /* Grand texte : sous-titres de sections */
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        /* Titre de niveau 3 */
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        /* Titre de niveau 2 */
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        /* Titre de niveau 1 */
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        /* Grand titre hero */
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        /* Très grand titre hero */
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
      },

      /* === ESPACEMENTS PERSONNALISÉS ===
       * Quelques valeurs non standard utilisées dans la mise en page END.
       */
      spacing: {
        /* Gouttière entre les cartes produit */
        '18': '4.5rem',
        /* Hauteur du header compressé au scroll */
        '13': '3.25rem',
        /* Hauteur du header normal */
        '15': '3.75rem',
        /* Largeur du drawer mini-panier */
        '96': '24rem',
        /* Largeur maximale du panneau de filtres */
        '72': '18rem',
      },

      /* === POINTS DE RUPTURE RESPONSIVES ===
       * Breakpoints alignés sur la grille END. :
       * mobile < 640px, tablette 640-1024px, desktop > 1024px
       */
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },

      /* === ANIMATIONS ET TRANSITIONS ===
       * Courbes et durées alignées sur les animations Framer Motion du site
       */
      transitionTimingFunction: {
        /* Courbe d'accélération douce utilisée pour les mega-menus */
        'end-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        /* Courbe pour les entrées d'éléments */
        'end-in': 'cubic-bezier(0.4, 0, 1, 1)',
        /* Courbe pour les sorties d'éléments */
        'end-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        /* Durée courte : survols et micro-interactions */
        '150': '150ms',
        /* Durée standard : ouvertures et fermetures de panneaux */
        '250': '250ms',
        /* Durée longue : mega-menu et drawer */
        '350': '350ms',
      },

      /* === OMBRES PORTÉES ===
       * Ombres subtiles pour les cartes produit et le drawer panier
       */
      boxShadow: {
        /* Ombre légère pour les cartes au survol */
        'end-card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        /* Ombre plus marquée pour le drawer et les modales */
        'end-drawer': '-4px 0 24px rgba(0, 0, 0, 0.15)',
        /* Ombre du header au scroll */
        'end-header': '0 2px 8px rgba(0, 0, 0, 0.12)',
      },

      /* === INDICES Z ===
       * Hiérarchie de superposition des éléments flottants
       */
      zIndex: {
        '40': '40', '50': '50', '60': '60', '70': '70', '80': '80', '90': '90',
        '9999': '9999', '99999': '99999',
      },
    },
  },

  plugins: [],
}

export default config
