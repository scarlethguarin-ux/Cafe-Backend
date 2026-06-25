const Proveedor = require('../models/Proveedor');

exports.createProveedor = async (req, res) => {
  const { nombre_empresa, contacto_principal, telefono, email, direccion } = req.body;
  if (!nombre_empresa) {
    return res.status(400).json({ success: false, message: 'El nombre de la empresa es requerido.' });
  }

  try {
    const proveedor = await Proveedor.create({
      nombre_empresa,
      contacto_principal,
      telefono,
      email,
      direccion
    });
    res.status(201).json({ success: true, data: proveedor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.status(200).json({ success: true, data: proveedores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
    }
    res.status(200).json({ success: true, data: proveedor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProveedor = async (req, res) => {
  const { nombre_empresa, contacto_principal, telefono, email, direccion } = req.body;

  try {
    const proveedor = await Proveedor.update(req.params.id, {
      nombre_empresa,
      contacto_principal,
      telefono,
      email,
      direccion
    });
    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
    }
    res.status(200).json({ success: true, data: proveedor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.delete(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Proveedor eliminado con éxito.', data: proveedor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
