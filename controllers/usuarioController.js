const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

exports.createUsuario = async (req, res) => {
  const { id_rol, email, password, activo } = req.body;
  if (!id_rol || !email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (id_rol, email, password).' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const usuario = await Usuario.create({
      id_rol,
      email,
      password_hash,
      activo: activo !== undefined ? activo : true
    });
    
    res.status(201).json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUsuario = async (req, res) => {
  const { id_rol, email, activo, password } = req.body;

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await Usuario.updatePassword(req.params.id, password_hash);
    }

    const usuario = await Usuario.update(req.params.id, { id_rol, email, activo });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.delete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Usuario eliminado con éxito.', data: usuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
