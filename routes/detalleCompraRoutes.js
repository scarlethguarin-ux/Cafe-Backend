const express = require('express');
const router = express.Router();
const detalleCompraController = require('../controllers/detalleCompraController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), detalleCompraController.createDetalleCompra);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), detalleCompraController.getAllDetallesCompras);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), detalleCompraController.getDetalleCompraById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), detalleCompraController.updateDetalleCompra);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), detalleCompraController.deleteDetalleCompra);

module.exports = router;
