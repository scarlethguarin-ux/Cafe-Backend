const express = require('express');
const router = express.Router();
const compraInsumoController = require('../controllers/compraInsumoController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createCompraInsumoSchema, updateCompraInsumoSchema } = require('../schemas');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), validateBody(createCompraInsumoSchema), compraInsumoController.createCompra);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), compraInsumoController.getAllCompras);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), compraInsumoController.getCompraById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), validateBody(updateCompraInsumoSchema), compraInsumoController.updateCompra);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), compraInsumoController.deleteCompra);

module.exports = router;
