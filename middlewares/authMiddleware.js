const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforcoffeeproducer123';

/**
 * Middleware para verificar que la petición tenga un token JWT válido.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acceso denegado. No se proporcionó un token de autenticación.' 
    });
  }

  // El token usualmente viene en formato: Bearer <TOKEN>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({ 
      success: false, 
      message: 'Formato de token inválido. Debe ser: Bearer <token>' 
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guardar datos del usuario autenticado en el objeto request
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido o expirado.' 
    });
  }
};

/**
 * Middleware para validar roles específicos en las rutas.
 * @param {Array<string>|string} allowedRoles Roles permitidos (ej. ['Administrador', 'Trabajador'])
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado. Falla de autorización.' 
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Asumimos que req.user contiene el nombre del rol (nombre_rol) o podemos validar por id
    if (!req.user.nombre_rol || !roles.includes(req.user.nombre_rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos suficientes para realizar esta acción.' 
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
