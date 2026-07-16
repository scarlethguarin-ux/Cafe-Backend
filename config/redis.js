const { createClient } = require('redis');

// Usará REDIS_URL de tus variables de entorno, o apuntará al localhost si no existe.
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Intentar reconectar máximo 3 veces y luego desistir
      if (retries > 3) {
        console.error('❌ Redis agotó los intentos de reconexión.');
        return new Error('Conexión a Redis rechazada demasiadas veces.');
      }
      // Reintentar cada 2 segundos
      return 2000;
    }
  }
});

redisClient.on('error', (err) => console.error('❌ Error en el cliente Redis:', err));
redisClient.on('connect', () => console.log('✅ Conectado a Redis exitosamente'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('No se pudo conectar a Redis', error);
  }
};

module.exports = {
  redisClient,
  connectRedis
};
