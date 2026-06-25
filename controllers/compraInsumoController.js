const CompraInsumo = require('../models/CompraInsumo');

exports.createCompra = async (req, res) => {
  const { id_proveedor, monto_total, fecha_compra } = req.body;
  if (!id_proveedor) {
    return res.status(400).json({ success: false, message: 'El id_proveedor es requerido.' });
  }

  try {
    const compra = await CompraInsumo.create({
      id_proveedor,
      monto_total: monto_total || 0,
      fecha_compra
    });
    res.status(201).json({ success: true, data: compra });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllCompras = async (req, res) => {
  try {
    const compras = await CompraInsumo.findAll();
    res.status(200).json({ success: true, data: compras });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCompraById = async (req, res) => {
  try {
    const compra = await CompraInsumo.findById(req.params.id);
    if (!compra) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada.' });
    }
    res.status(200).json({ success: true, data: compra });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCompra = async (req, res) => {
  const { id_proveedor, monto_total, fecha_compra } = req.body;

  try {
    const compra = await CompraInsumo.update(req.params.id, {
      id_proveedor,
      monto_total,
      fecha_compra
    });
    if (!compra) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada.' });
    }
    res.status(200).json({ success: true, data: compra });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCompra = async (req, res) => {
  try {
    const compra = await CompraInsumo.delete(req.params.id);
    if (!compra) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada.' });
    }
    res.status(200).json({ success: true, message: 'Compra eliminada con éxito.', data: compra });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
