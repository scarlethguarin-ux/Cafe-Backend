const Trabajador = require('../models/Trabajador');

exports.createTrabajador = async (req, res) => {
  const { id_usuario, nombre_completo, cedula, cargo, fecha_contratacion, telefono } = req.body;
  if (!nombre_completo || !cedula) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (nombre_completo, cedula).' });
  }

  try {
    const trabajador = await Trabajador.create({
      id_usuario,
      nombre_completo,
      cedula,
      cargo,
      fecha_contratacion,
      telefono
    });
    res.status(201).json({ success: true, data: trabajador });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllTrabajadores = async (req, res) => {
  try {
    const trabajadores = await Trabajador.findAll();
    res.status(200).json({ success: true, data: trabajadores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrabajadorById = async (req, res) => {
  try {
    const trabajador = await Trabajador.findById(req.params.id);
    if (!trabajador) {
      return res.status(404).json({ success: false, message: 'Trabajador no encontrado.' });
    }
    res.status(200).json({ success: true, data: trabajador });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTrabajador = async (req, res) => {
  const { nombre_completo, cedula, cargo, fecha_contratacion, telefono } = req.body;

  try {
    const trabajador = await Trabajador.update(req.params.id, {
      nombre_completo,
      cedula,
      cargo,
      fecha_contratacion,
      telefono
    });
    if (!trabajador) {
      return res.status(404).json({ success: false, message: 'Trabajador no encontrado.' });
    }
    res.status(200).json({ success: true, data: trabajador });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTrabajador = async (req, res) => {
  try {
    const trabajador = await Trabajador.delete(req.params.id);
    if (!trabajador) {
      return res.status(404).json({ success: false, message: 'Trabajador no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Trabajador eliminado con éxito.', data: trabajador });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
