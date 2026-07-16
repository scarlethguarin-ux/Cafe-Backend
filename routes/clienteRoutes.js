const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createClienteSchema, updateClienteSchema } = require('../schemas');
const { cacheGet } = require('../middlewares/cacheMiddleware');

// Rutas de administración de clientes
router.post('/', verifyToken, validateBody(createClienteSchema), clienteController.createCliente);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), cacheGet(300), clienteController.getAllClientes);
router.get('/:id', verifyToken, cacheGet(300), clienteController.getClienteById);
router.put('/:id', verifyToken, validateBody(updateClienteSchema), clienteController.updateCliente);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), clienteController.deleteCliente);

module.exports = router;
