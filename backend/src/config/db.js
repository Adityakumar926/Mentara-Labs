const { Pool } = require('pg');

const isLocal = !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1');

let connectionString = process.env.DATABASE_URL;

// Automatically map Supabase direct connection to IPv4 pooler host to prevent local IPv6 connection timeouts
if (connectionString && connectionString.includes('db.nphplkhrqtvgizzbsbqw.supabase.co')) {
  connectionString = connectionString
    .replace('db.nphplkhrqtvgizzbsbqw.supabase.co:5432', 'aws-1-ap-northeast-2.pooler.supabase.com:6543')
    .replace('://postgres:', '://postgres.nphplkhrqtvgizzbsbqw:');
}

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 60000,        // keep idle connections for 60s
  connectionTimeoutMillis: 10000,  // wait up to 10s for a connection
  keepAlive: true,                 // send TCP keep-alive to prevent drop
  keepAliveInitialDelayMillis: 10000,
});

// Do NOT crash the server on connection drop — let the pool reconnect automatically
pool.on('error', (err, client) => {
  console.error('[DB] Idle client error — pool will reconnect automatically:', err.message);
});

// Verify connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Failed to connect on startup:', err.message);
  } else {
    console.log('[DB] PostgreSQL connected successfully');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};