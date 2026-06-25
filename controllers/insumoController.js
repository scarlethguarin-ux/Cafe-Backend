const Insumo = require('../models/Insumo');

exports.createInsumo = async (req, res) => {
  const { id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock } = req.body;
  if (!nombre_insumo || !unidad_medida) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (nombre_insumo, unidad_medida).' });
  }

  try {
    const insumo = await Insumo.create({
      id_proveedor,
      nombre_insumo,
      categoria,
      unidad_medida,
      cantidad_stock: cantidad_stock || 0
    });
    res.status(201).json({ success: true, data: insumo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllInsumos = async (req, res) => {
  try {
    const insumos = await Insumo.findAll();
    res.status(200).json({ success: true, data: insumos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getInsumoById = async (req, res) => {
  try {
    const insumo = await Insumo.findById(req.params.id);
    if (!insumo) {
      return res.status(404).json({ success: false, message: 'Insumo no encontrado.' });
    }
    res.status(200).json({ success: true, data: insumo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateInsumo = async (req, res) => {
  const { id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock } = req.body;

  try {
    const insumo = await Insumo.update(req.params.id, {
      id_proveedor,
      nombre_insumo,
      categoria,
      unidad_medida,
      cantidad_stock
    });
    if (!insumo) {
      return res.status(404).json({ success: false, message: 'Insumo no encontrado.' });
    }
    res.status(200).json({ success: true, data: insumo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteInsumo = async (req, res) => {
  try {
    const insumo = await Insumo.delete(req.params.id);
    if (!insumo) {
      return res.status(404).json({ success: false, message: 'Insumo no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Insumo eliminado con éxito.', data: insumo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
