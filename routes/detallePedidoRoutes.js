const express = require('express');
const router = express.Router();
const detallePedidoController = require('../controllers/detallePedidoController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas protegidas
router.post('/', verifyToken, detallePedidoController.createDetallePedido);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), detallePedidoController.getAllDetallesPedidos);
router.get('/:id', verifyToken, detallePedidoController.getDetallePedidoById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), detallePedidoController.updateDetallePedido);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), detallePedidoController.deleteDetallePedido);

module.exports = router;
