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
})
