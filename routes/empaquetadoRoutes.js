const express = require('express');
const router = express.Router();
const empaquetadoController = require('../controllers/empaquetadoController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), empaquetadoController.createEmpaquetado);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), empaquetadoController.getAllEmpaquetados);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), empaquetadoController.getEmpaquetadoById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), empaquetadoController.updateEmpaquetado);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), empaquetadoController.deleteEmpaquetado);

module.exports = router;
