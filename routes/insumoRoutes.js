const express = require('express');
const router = express.Router();
const insumoController = require('../controllers/insumoController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createInsumoSchema, updateInsumoSchema } = require('../schemas');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), validateBody(createInsumoSchema), insumoController.createInsumo);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), insumoController.getAllInsumos);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), insumoController.getInsumoById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), validateBody(updateInsumoSchema), insumoController.updateInsumo);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), insumoController.deleteInsumo);

module.exports = router;
