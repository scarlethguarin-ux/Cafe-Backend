const express = require('express');
const router = express.Router();
const productoFinalController = require('../controllers/productoFinalController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Obtener productos finalizados es público para permitir navegación e-commerce
router.get('/', productoFinalController.getAllProductos);
router.get('/:id', productoFinalController.getProductoById);

// Rutas de administración protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), productoFinalController.createProducto);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), productoFinalController.updateProducto);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), productoFinalController.deleteProducto);

module.exports = router;
