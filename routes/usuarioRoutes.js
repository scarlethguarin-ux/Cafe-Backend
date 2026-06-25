const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');
const { createUsuarioSchema, updateUsuarioSchema } = require('../schemas');

// Rutas de administración de usuarios (Solo Administrador)
router.post('/', verifyToken, authorizeRoles('Administrador'), validateBody(createUsuarioSchema), usuarioController.createUsuario);
router.get('/', verifyToken, authorizeRoles('Administrador'), usuarioController.getAllUsuarios);
router.get('/:id', verifyToken, authorizeRoles('Administrador'), usuarioController.getUsuarioById);
router.put('/:id', verifyToken, authorizeRoles('Administrador'), validateBody(updateUsuarioSchema), usuarioController.updateUsuario);
router.delete('/:id', verifyToken, authorizeRoles('Administrador'), usuarioController.deleteUsuario);

module.exports = router;
