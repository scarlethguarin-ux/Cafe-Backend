const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas protegidas (Administrador o Trabajador)
router.post('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), loteController.createLote);
router.get('/', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), loteController.getAllLotes);
router.get('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), loteController.getLoteById);
router.put('/:id', verifyToken, authorizeRoles(['Administrador', 'Trabajador']), loteController.updateLote);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), loteController.deleteLote);

module.exports = router;
