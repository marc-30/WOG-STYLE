/**
 * @fichier postcss.config.js
 * @rôle Configuration PostCSS pour le traitement des fichiers CSS.
 *        Active le plugin Tailwind CSS et Autoprefixer pour la compatibilité navigateurs.
 * @dépendances postcss, tailwindcss, autoprefixer
 * @auteur Clone END. Clothing
 * @date 2024-01-01
 */

module.exports = {
  plugins: {
    /* Plugin Tailwind CSS — génère les classes utilitaires */
    tailwindcss: {},
    /* Autoprefixer — ajoute les préfixes vendeurs CSS automatiquement */
    autoprefixer: {},
  },
}
