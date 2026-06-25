const Cliente = require('../models/Cliente');

exports.createCliente = async (req, res) => {
  const { id_usuario, nombre_razon_social, identificacion_fiscal, telefono, direccion_envio } = req.body;
  if (!nombre_razon_social || !identificacion_fiscal) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (nombre_razon_social, identificacion_fiscal).' });
  }

  try {
    const cliente = await Cliente.create({
      id_usuario,
      nombre_razon_social,
      identificacion_fiscal,
      telefono,
      direccion_envio
    });
    res.status(201).json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.status(200).json({ success: true, data: clientes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }
    res.status(200).json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  const { nombre_razon_social, identificacion_fiscal, telefono, direccion_envio } = req.body;

  try {
    const cliente = await Cliente.update(req.params.id, {
      nombre_razon_social,
      identificacion_fiscal,
      telefono,
      direccion_envio
    });
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }
    res.status(200).json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.delete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Cliente eliminado con éxito.', data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
