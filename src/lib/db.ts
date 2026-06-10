import mysql from 'mysql2/promise'

// Singleton — évite de créer plusieurs pools pendant le hot-reload Next.js
// et limite les connexions en production serverless (Vercel)
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined
}

const pool = globalThis._mysqlPool ?? mysql.createPool({
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
})

// En dev uniquement : stocker dans globalThis pour survivre aux hot-reloads
if (process.env.NODE_ENV !== 'production') globalThis._mysqlPool = pool

export default pool
