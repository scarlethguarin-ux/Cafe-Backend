const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas protegidas
router.post('/', verifyToken, pedidoController.createPedido);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), pedidoController.getAllPedidos);
router.get('/:id', verifyToken, pedidoController.getPedidoById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), pedidoController.updatePedido);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), pedidoController.deletePedido);

module.exports = router;
