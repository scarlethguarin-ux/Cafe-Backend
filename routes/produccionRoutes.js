const express = require('express');
const router = express.Router();
const produccionController = require('../controllers/produccionController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), produccionController.createProduccion);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), produccionController.getAllProducciones);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), produccionController.getProduccionById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), produccionController.updateProduccion);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), produccionController.deleteProduccion);

module.exports = router;
