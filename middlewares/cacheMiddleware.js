const { redisClient } = require('../config/redis');

/**
 * Middleware para cachear respuestas GET.
 * @param {number} ttlSeconds - Tiempo de vida de la caché en segundos (por defecto 300s = 5 min).
 */
const cacheGet = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // 1. Esto solo debería usarse en peticiones GET
    if (req.method !== 'GET') {
      return next();
    }

    // 1.5 Si Redis no está conectado, ignorar la caché
    if (!redisClient.isReady) {
      return next();
    }

    // 2. Generamos una clave única basada en la URL que se está visitando
    const key = `cache:${req.originalUrl}`;

    try {
      // 3. Comprobamos si la data ya existe en Redis
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`⚡ Retornando de Caché: ${key}`);
        // Si existe, la parseamos y la devolvemos inmediatamente
        return res.json(JSON.parse(cachedData));
      }

      console.log(`🔍 No en caché, yendo a BD: ${key}`);
      
      // 4. Si NO existe, interceptamos la función res.json
      const originalJson = res.json.bind(res);
      
      res.json = (body) => {
        // 5. Guardamos en Redis la respuesta antes de enviarla
        redisClient.setEx(key, ttlSeconds, JSON.stringify(body))
          .catch(err => console.error('Error al guardar en Redis:', err));
        
        // 6. Devolvemos la respuesta original al cliente
        return originalJson(body);
      };

      next(); // Pasamos el control al controlador
    } catch (error) {
      // Si falla, pasamos directo al controlador sin loguear el error pesado
      next(); 
    }
  };
};

module.exports = { cacheGet };
