const app = require('./app');
const db = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Verificar conexión a la base de datos antes de iniciar el servidor
const startServer = async () => {
  try {
    console.log('Iniciando comprobación de conexión a base de datos...');
    const result = await db.query('SELECT NOW()');
    console.log(`Conexión a PostgreSQL establecida con éxito. Hora del servidor BD: ${result.rows[0].now}`);
    
    // Asegurar que la columna imagen existe en productos_finales
    await db.query(`
      ALTER TABLE productos_finales 
      ADD COLUMN IF NOT EXISTS imagen TEXT;
    `);
    console.log('Esquema de base de datos verificado: columna "imagen" asegurada.');
    
    // Escuchar peticiones en el puerto configurado
    app.listen(PORT, () => {
      console.log(`========================================================`);
      console.log(` Servidor Backend de Productora de Café listo.`);
      console.log(` Puerto de escucha: ${PORT}`);
      console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(` URL base local: http://localhost:${PORT}`);
      console.log(`========================================================`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    console.error('Verifique sus credenciales de base de datos en el archivo .env.');
    process.exit(1);
  }
};

startServer();
