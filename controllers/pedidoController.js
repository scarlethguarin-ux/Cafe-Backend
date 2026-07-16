const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const DetallePedido = require('../models/DetallePedido');
const { sendInvoiceEmail } = require('../services/emailService');

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

    // Verificar si el estado del pedido acaba de cambiar a "Aceptado"
    if (estado_pedido && estado_pedido.toLowerCase() === 'aceptado') {
      try {
        // Obtener datos del cliente (que incluye el email)
        const cliente = await Cliente.findById(pedido.id_cliente);
        if (cliente && cliente.email) {
          // Obtener los detalles del pedido
          const detalles = await DetallePedido.findByPedidoId(pedido.id_pedido);
          
          // Calcular subtotal por producto si no viene
          const detallesConSubtotal = detalles.map(d => ({
            ...d,
            subtotal: d.cantidad * d.precio_unitario
          }));

          // Enviar correo de factura de forma asíncrona
          sendInvoiceEmail(cliente.email, pedido, detallesConSubtotal);
        }
      } catch (errorCorreo) {
        console.error('Error al intentar enviar la factura:', errorCorreo);
        // No rompemos la petición, el pedido ya se actualizó
      }
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
