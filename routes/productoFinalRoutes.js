const express = require('express');
const router = express.Router();
const productoFinalController = require('../controllers/productoFinalController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Límite de 30 peticiones
  message: {
    success: false,
    message: "Demasiadas peticiones. Por favor, intenta de nuevo en 1 minuto."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Obtener productos finalizados es público para permitir navegación e-commerce
router.get('/', apiLimiter, productoFinalController.getAllProductos);
router.get('/:id', productoFinalController.getProductoById);

// Rutas de administración protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), productoFinalController.createProducto);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), productoFinalController.updateProducto);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), productoFinalController.deleteProducto);

module.exports = router;
