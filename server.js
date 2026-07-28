/**
 * Point d'entrée pour l'hébergement cPanel LWS (Node.js via Passenger).
 * À déclarer comme "Application Startup File" dans Setup Node.js App.
 * En local / sur Vercel, `npm run dev` et `npm run build && npm start` restent inchangés.
 */
const { createServer } = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Serveur WOG-STYLE prêt sur le port ${port}`)
  })

  // Fait avancer automatiquement les commandes payées vers "En préparation" après 10 min
  // (voir /api/internal/avancer-commandes). Pas de cron système sur l'hébergement mutualisé
  // LWS : on simule via un intervalle interne, tant que ce process Node reste vivant.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    setInterval(() => {
      const req = require('http').request(
        { hostname: 'localhost', port, path: '/api/internal/avancer-commandes', method: 'POST', headers: { 'x-cron-secret': cronSecret } },
        (res) => res.resume()
      )
      req.on('error', (err) => console.error('[cron] avancer-commandes', err.message))
      req.end()
    }, 60 * 1000)
  } else {
    console.warn('[cron] CRON_SECRET non configurée — passage automatique en "En préparation" désactivé')
  }
})
