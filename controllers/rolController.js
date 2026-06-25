const Rol = require('../models/Rol');

exports.createRol = async (req, res) => {
  const { nombre_rol } = req.body;
  if (!nombre_rol) {
    return res.status(400).json({ success: false, message: 'El nombre del rol es requerido.' });
  }

  try {
    const rol = await Rol.create({ nombre_rol });
    res.status(201).json({ success: true, data: rol });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRolById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ success: false, message: 'Rol no encontrado.' });
    }
    res.status(200).json({ success: true, data: rol });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRol = async (req, res) => {
  const { nombre_rol } = req.body;
  if (!nombre_rol) {
    return res.status(400).json({ success: false, message: 'El nombre del rol es requerido.' });
  }

  try {
    const rol = await Rol.update(req.params.id, { nombre_rol });
    if (!rol) {
      return res.status(404).json({ success: false, message: 'Rol no encontrado.' });
    }
    res.status(200).json({ success: true, data: rol });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRol = async (req, res) => {
  try {
    const rol = await Rol.delete(req.params.id);
    if (!rol) {
      return res.status(404).json({ success: false, message: 'Rol no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Rol eliminado con éxito.', data: rol });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
