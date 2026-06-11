/**
 * @fichier components/ui/WhatsAppButton.tsx
 * @rôle Bouton flottant de service client WhatsApp.
 *        Affiché en bas à droite sur toutes les pages.
 *        Lien direct vers le numéro WhatsApp du service client WOG-STYLE.
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * WhatsAppButton — bouton flottant WhatsApp fixe en bas à droite.
 *
 * Clique ouvre WhatsApp avec un message pré-rempli vers le service client.
 * Affiche un tooltip au survol.
 */
export const WhatsAppButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false)

  const whatsappUrl =
    'https://wa.me/2250585494848?text=Bonjour%20WOG-STYLE%2C%20j%27ai%20besoin%20d%27aide.'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-end-black text-end-white text-xs font-semibold px-3 py-2 rounded whitespace-nowrap shadow-lg"
          >
            Service client — Discuter sur WhatsApp
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton WhatsApp */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter le service client sur WhatsApp"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-[#25D366] text-white hover:bg-[#1ebe5b] transition-colors"
      >
        {/* Icône WhatsApp SVG officielle */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.617 4.56 1.695 6.479L2.667 29.333l7.04-1.664A13.264 13.264 0 0 0 16.004 29.333c7.36 0 13.329-5.973 13.329-13.333S23.364 2.667 16.004 2.667zm0 24A10.624 10.624 0 0 1 10.4 24.96l-.395-.235-4.16.987.987-4.053-.256-.416A10.573 10.573 0 0 1 5.333 16c0-5.888 4.779-10.667 10.667-10.667S26.667 10.112 26.667 16 21.888 26.667 16.004 26.667zm5.845-7.989c-.32-.16-1.888-.933-2.181-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.352-.499-2.573-1.589-.952-.848-1.595-1.893-1.781-2.213-.187-.32-.021-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.26-.624-.525-.539-.72-.549l-.613-.011a1.18 1.18 0 0 0-.853.4c-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.461 4.827.763.328 1.359.524 1.823.672.765.243 1.461.208 2.011.127.613-.091 1.888-.773 2.155-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
        </svg>
      </motion.a>
    </div>
  )
}

export default WhatsAppButton
