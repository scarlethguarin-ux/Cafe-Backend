const Lote = require('../models/Lote');

exports.createLote = async (req, res) => {
  const { codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado } = req.body;
  if (!codigo_lote || isNaN(capacidad_maxima)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios o formato inválido (codigo_lote, capacidad_maxima).' });
  }

  try {
    const lote = await Lote.create({
      codigo_lote,
      descripcion,
      capacidad_maxima,
      capacidad_actual: capacidad_actual || 0,
      estado: estado || 'Activo'
    });
    res.status(201).json({ success: true, data: lote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllLotes = async (req, res) => {
  try {
    const lotes = await Lote.findAll();
    res.status(200).json({ success: true, data: lotes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLoteById = async (req, res) => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) {
      return res.status(404).json({ success: false, message: 'Lote no encontrado.' });
    }
    res.status(200).json({ success: true, data: lote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateLote = async (req, res) => {
  const { codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado } = req.body;

  try {
    const lote = await Lote.update(req.params.id, {
      codigo_lote,
      descripcion,
      capacidad_maxima,
      capacidad_actual,
      estado
    });
    if (!lote) {
      return res.status(404).json({ success: false, message: 'Lote no encontrado.' });
    }
    res.status(200).json({ success: true, data: lote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteLote = async (req, res) => {
  try {
    const lote = await Lote.delete(req.params.id);
    if (!lote) {
      return res.status(404).json({ success: false, message: 'Lote no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Lote eliminado con éxito.', data: lote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
