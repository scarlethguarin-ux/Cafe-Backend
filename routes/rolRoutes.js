const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createRolSchema, updateRolSchema } = require('../schemas');

// Rutas protegidas (Solo Administrador puede gestionar roles)
router.post('/', verifyToken, authorizeRoles('Administrador'), validateBody(createRolSchema), rolController.createRol);
router.get('/', verifyToken, authorizeRoles('Administrador'), rolController.getAllRoles);
router.get('/:id', verifyToken, authorizeRoles('Administrador'), rolController.getRolById);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), validateBody(updateRolSchema), rolController.updateRol);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), rolController.deleteRol);

module.exports = router;
