const express = require('express');
const router = express.Router();
const trabajadorController = require('../controllers/trabajadorController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createTrabajadorSchema, updateTrabajadorSchema } = require('../schemas');

// Rutas protegidas (Administrador)
router.post('/', verifyToken, authorizeRoles('Administrador'), validateBody(createTrabajadorSchema), trabajadorController.createTrabajador);
router.get('/', verifyToken, authorizeRoles('Administrador'), trabajadorController.getAllTrabajadores);
router.get('/:id', verifyToken, authorizeRoles('Administrador'), trabajadorController.getTrabajadorById);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), validateBody(updateTrabajadorSchema), trabajadorController.updateTrabajador);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), trabajadorController.deleteTrabajador);

module.exports = router;
