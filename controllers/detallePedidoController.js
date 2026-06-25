const db = require('../config/db');
const DetallePedido = require('../models/DetallePedido');

exports.createDetallePedido = async (req, res) => {
  const { id_pedido, id_producto, cantidad, precio_unitario } = req.body;
  if (!id_pedido || !id_producto || isNaN(cantidad) || isNaN(precio_unitario)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios o formato inválido.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener y bloquear el producto final para evitar condiciones de carrera (Concurrency control)
    const productQuery = 'SELECT * FROM productos_finales WHERE id_producto = $1 FOR UPDATE';
    const productRes = await client.query(productQuery, [id_producto]);

    if (productRes.rowCount === 0) {
      throw new Error(`El producto con id ${id_producto} no existe.`);
    }

    const producto = productRes.rows[0];

    // 2. Validar que haya suficiente stock disponible
    if (parseInt(producto.stock_disponible) < parseInt(cantidad)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente para el producto "${producto.nombre_producto}". Stock disponible: ${producto.stock_disponible}, solicitado: ${cantidad}. Operación abortada.`
      });
    }

    // 3. Restar la cantidad del stock_disponible del producto_final
    const updateProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible - $1 
      WHERE id_producto = $2
    `;
    await client.query(updateProductSql, [cantidad, id_producto]);

    // 4. Crear el detalle del pedido
    const detalle = await DetallePedido.create({
      id_pedido,
      id_producto,
      cantidad,
      precio_unitario
    }, client);

    // 5. Sumar el costo al monto_total del pedido principal
    const subtotal = cantidad * precio_unitario;
    const updatePedidoSql = `
      UPDATE pedidos 
      SET monto_total = monto_total + $1 
      WHERE id_pedido = $2
    `;
    const pedidoResult = await client.query(updatePedidoSql, [subtotal, id_pedido]);
    if (pedidoResult.rowCount === 0) {
      throw new Error(`El pedido con id ${id_pedido} no existe.`);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: detalle });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de creación de detalle pedido:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.getAllDetallesPedidos = async (req, res) => {
  try {
    const detalles = await DetallePedido.findAll();
    res.status(200).json({ success: true, data: detalles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDetallePedidoById = async (req, res) => {
  try {
    const detalle = await DetallePedido.findById(req.params.id);
    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado.' });
    }
    res.status(200).json({ success: true, data: detalle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDetallePedido = async (req, res) => {
  const { id_pedido, id_producto, cantidad, precio_unitario } = req.body;
  const id_detalle = req.params.id;

  if (cantidad !== undefined && isNaN(cantidad)) {
    return res.status(400).json({ success: false, message: 'Cantidad inválida.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener original
    const originalDetalle = await DetallePedido.findById(id_detalle);
    if (!originalDetalle) {
      return res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado.' });
    }

    const targetProduct = id_producto || originalDetalle.id_producto;
    const targetCantidad = cantidad !== undefined ? parseInt(cantidad) : originalDetalle.cantidad;
    const targetPrecio = precio_unitario !== undefined ? precio_unitario : originalDetalle.precio_unitario;

    // 1. Devolver stock al producto original temporalmente
    const restoreProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible + $1 
      WHERE id_producto = $2
    `;
    await client.query(restoreProductSql, [originalDetalle.cantidad, originalDetalle.id_producto]);

    // 2. Bloquear y verificar stock del producto destino
    const productQuery = 'SELECT * FROM productos_finales WHERE id_producto = $1 FOR UPDATE';
    const productRes = await client.query(productQuery, [targetProduct]);
    if (productRes.rowCount === 0) {
      throw new Error(`El producto destino con id ${targetProduct} no existe.`);
    }

    const targetProd = productRes.rows[0];

    // Verificar si el stock del producto destino alcanza
    if (parseInt(targetProd.stock_disponible) < targetCantidad) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente para el producto destino "${targetProd.nombre_producto}". Disponible: ${targetProd.stock_disponible}, solicitado: ${targetCantidad}.`
      });
    }

    // 3. Restar stock del producto destino
    const deductProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible - $1 
      WHERE id_producto = $2
    `;
    await client.query(deductProductSql, [targetCantidad, targetProduct]);

    // 4. Restar subtotal original de la factura del pedido original
    const restorePedidoSql = `
      UPDATE pedidos 
      SET monto_total = monto_total - $1 
      WHERE id_pedido = $2
    `;
    const originalSubtotal = originalDetalle.cantidad * originalDetalle.precio_unitario;
    await client.query(restorePedidoSql, [originalSubtotal, originalDetalle.id_pedido]);

    // 5. Sumar subtotal nuevo a la factura del pedido destino
    const targetPedido = id_pedido || originalDetalle.id_pedido;
    const newSubtotal = targetCantidad * targetPrecio;
    const updatePedidoSql = `
      UPDATE pedidos 
      SET monto_total = monto_total + $1 
      WHERE id_pedido = $2
    `;
    await client.query(updatePedidoSql, [newSubtotal, targetPedido]);

    // 6. Realizar el update
    const updated = await DetallePedido.update(id_detalle, {
      id_pedido: targetPedido,
      id_producto: targetProduct,
      cantidad: targetCantidad,
      precio_unitario: targetPrecio
    });

    await client.query('COMMIT');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de actualización de detalle pedido:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.deleteDetallePedido = async (req, res) => {
  const id_detalle = req.params.id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener actual
    const originalDetalle = await DetallePedido.findById(id_detalle);
    if (!originalDetalle) {
      return res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado.' });
    }

    // 1. Devolver la cantidad al stock_disponible del producto final
    const restoreProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible + $1 
      WHERE id_producto = $2
    `;
    await client.query(restoreProductSql, [originalDetalle.cantidad, originalDetalle.id_producto]);

    // 2. Restar el subtotal del monto_total del pedido
    const subtotal = originalDetalle.cantidad * originalDetalle.precio_unitario;
    const restorePedidoSql = `
      UPDATE pedidos 
      SET monto_total = monto_total - $1 
      WHERE id_pedido = $2
    `;
    await client.query(restorePedidoSql, [subtotal, originalDetalle.id_pedido]);

    // 3. Eliminar el detalle de pedido
    const deleted = await DetallePedido.delete(id_detalle);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Detalle de pedido eliminado y stock devuelto.', data: deleted });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de eliminación de detalle pedido:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
