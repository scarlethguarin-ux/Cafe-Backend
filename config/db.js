const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'kafe_db',
  ssl: {
    rejectUnauthorized: false // <-- Esto evita el error de certificado auto-firmado
  },
  port: process.env.DB_PORT || 5432,
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo de inactividad para cerrar un cliente
  connectionTimeoutMillis: 2000, // Tiempo límite para establecer conexión
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente del pool de PostgreSQL:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Exportamos el pool directamente para transacciones avanzadas (BEGIN/COMMIT/ROLLBACK)
};
