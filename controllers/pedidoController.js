const Pedido = require('../models/Pedido');

exports.createPedido = async (req, res) => {
  const { id_cliente, estado_pedido, monto_total, fecha_pedido } = req.body;
  if (!id_cliente) {
    return res.status(400).json({ success: false, message: 'El id_cliente es requerido.' });
  }

  try {
    const pedido = await Pedido.create({
      id_cliente,
      estado_pedido: estado_pedido || 'Pendiente',
      monto_total: monto_total || 0,
      fecha_pedido
    });
    res.status(201).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll();
    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }
    res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePedido = async (req, res) => {
  const { id_cliente, estado_pedido, monto_total, fecha_pedido } = req.body;

  try {
    const pedido = await Pedido.update(req.params.id, {
      id_cliente,
      estado_pedido,
      monto_total,
      fecha_pedido
    });
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }
    res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePedido = async (req, res) => {
  try {
    const pedido = await Pedido.delete(req.params.id);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Pedido eliminado con éxito.', data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
