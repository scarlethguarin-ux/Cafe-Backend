const { createClient } = require('redis');

// Usará REDIS_URL de tus variables de entorno, o apuntará al localhost si no existe.
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Retornar false para cancelar la reconexión inmediatamente
      return false;
    }
  }
});

// Silenciar los errores de conexión para evitar que llenen la consola
redisClient.on('error', (err) => {
  if (err.code === 'ECONNREFUSED' || (err.message && err.message.includes('ECONNREFUSED'))) {
    return;
  }
});
redisClient.on('connect', () => console.log('✅ Conectado a Redis exitosamente'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log('⚠️ Aviso: Redis no está disponible. La caché estará desactivada, pero la aplicación funcionará normalmente.');
  }
};

module.exports = {
  redisClient,
  connectRedis
};
