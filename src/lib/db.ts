import mysql from 'mysql2/promise'

// Singleton — évite de créer plusieurs pools pendant le hot-reload Next.js
// et limite les connexions en production serverless (Vercel)
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined
}

const rawPool = globalThis._mysqlPool ?? mysql.createPool({
  host:            process.env.DB_HOST     ?? 'localhost',
  user:            process.env.DB_USER     ?? 'root',
  password:        process.env.DB_PASSWORD ?? '',
  database:        process.env.DB_NAME     ?? 'wog_database',
  port:            parseInt(process.env.DB_PORT ?? '3306'),
  waitForConnections: true,
  // En production (serverless), chaque instance Vercel a son propre pool
  // → on garde une limite basse pour ne pas saturer MySQL cloud
  connectionLimit: process.env.NODE_ENV === 'production' ? 3 : 10,
  queueLimit:      0,
  timezone:        '+00:00',
  decimalNumbers:  true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
})

// En dev uniquement : stocker dans globalThis pour survivre aux hot-reloads
if (process.env.NODE_ENV !== 'production') globalThis._mysqlPool = rawPool

// L'hébergement mutualisé (LWS) ferme les connexions inactives plus vite que les
// instances Vercel ne restent "chaudes" entre deux requêtes → la requête suivante
// tombe parfois sur une connexion déjà fermée (PROTOCOL_CONNECTION_LOST). Le pool
// mysql2 évince la connexion mais la requête en cours échoue quand même : on la
// retente une fois, cette fois sur une connexion fraîche.
const RETRYABLE_CODES = new Set(['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'])

const pool = new Proxy(rawPool, {
  get(target, prop, receiver) {
    if (prop === 'execute') {
      return async (...args: Parameters<typeof target.execute>) => {
        try {
          return await target.execute(...args)
        } catch (error) {
          const code = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined
          if (code && RETRYABLE_CODES.has(code)) {
            return await target.execute(...args)
          }
          throw error
        }
      }
    }
    return Reflect.get(target, prop, receiver)
  },
}) as mysql.Pool

export default pool
