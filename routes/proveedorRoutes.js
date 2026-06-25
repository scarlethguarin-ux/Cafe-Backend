const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createProveedorSchema, updateProveedorSchema } = require('../schemas');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), validateBody(createProveedorSchema), proveedorController.createProveedor);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), proveedorController.getAllProveedores);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), proveedorController.getProveedorById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), validateBody(updateProveedorSchema), proveedorController.updateProveedor);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), proveedorController.deleteProveedor);

module.exports = router;
