const db = require('../config/db');
const DetalleCompra = require('../models/DetalleCompra');

exports.createDetalleCompra = async (req, res) => {
  const { id_compra, id_insumo, cantidad, precio_unitario } = req.body;
  if (!id_compra || !id_insumo || isNaN(cantidad) || isNaN(precio_unitario)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios o formato inválido.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Crear el detalle de compra
    const detalle = await DetalleCompra.create({
      id_compra,
      id_insumo,
      cantidad,
      precio_unitario
    }, client);

    // 2. Sumar cantidad al cantidad_stock del insumo correspondiente
    const updateInsumoSql = `
      UPDATE insumos 
      SET cantidad_stock = cantidad_stock + $1 
      WHERE id_insumo = $2 
      RETURNING *
    `;
    const insumoResult = await client.query(updateInsumoSql, [cantidad, id_insumo]);
    if (insumoResult.rowCount === 0) {
      throw new Error(`Insumo con id ${id_insumo} no existe.`);
    }

    // 3. Sumar el subtotal al monto_total de la compra de insumos
    const subtotal = cantidad * precio_unitario;
    const updateCompraSql = `
      UPDATE compras_insumos 
      SET monto_total = monto_total + $1 
      WHERE id_compra = $2
    `;
    const compraResult = await client.query(updateCompraSql, [subtotal, id_compra]);
    if (compraResult.rowCount === 0) {
      throw new Error(`Compra con id ${id_compra} no existe.`);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: detalle });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de creación de detalle compra:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.getAllDetallesCompras = async (req, res) => {
  try {
    const detalles = await DetalleCompra.findAll();
    res.status(200).json({ success: true, data: detalles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDetalleCompraById = async (req, res) => {
  try {
    const detalle = await DetalleCompra.findById(req.params.id);
    if (!detalle) {
      return res.status(404).json({ success: false, message: 'Detalle de compra no encontrado.' });
    }
    res.status(200).json({ success: true, data: detalle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateDetalleCompra = async (req, res) => {
  const { id_compra, id_insumo, cantidad, precio_unitario } = req.body;
  const id_detalle = req.params.id;

  if (cantidad !== undefined && isNaN(cantidad)) {
    return res.status(400).json({ success: false, message: 'Cantidad inválida.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener detalle actual
    const originalDetalle = await DetalleCompra.findById(id_detalle);
    if (!originalDetalle) {
      return res.status(404).json({ success: false, message: 'Detalle de compra no encontrado.' });
    }

    const targetInsumo = id_insumo || originalDetalle.id_insumo;
    const targetCantidad = cantidad !== undefined ? cantidad : originalDetalle.cantidad;
    const targetPrecio = precio_unitario !== undefined ? precio_unitario : originalDetalle.precio_unitario;

    // Ajustar stock del insumo original (restar la cantidad vieja)
    const restoreOriginalInsumoSql = `
      UPDATE insumos 
      SET cantidad_stock = cantidad_stock - $1 
      WHERE id_insumo = $2
    `;
    await client.query(restoreOriginalInsumoSql, [originalDetalle.cantidad, originalDetalle.id_insumo]);

    // Ajustar stock del insumo destino (sumar la cantidad nueva)
    const updateTargetInsumoSql = `
      UPDATE insumos 
      SET cantidad_stock = cantidad_stock + $1 
      WHERE id_insumo = $2
    `;
    await client.query(updateTargetInsumoSql, [targetCantidad, targetInsumo]);

    // Ajustar el monto_total de la compra original (restar precio * cantidad original)
    const restoreOriginalCompraSql = `
      UPDATE compras_insumos 
      SET monto_total = monto_total - $1 
      WHERE id_compra = $2
    `;
    const originalSubtotal = originalDetalle.cantidad * originalDetalle.precio_unitario;
    await client.query(restoreOriginalCompraSql, [originalSubtotal, originalDetalle.id_compra]);

    // Ajustar el monto_total de la compra destino (sumar precio * cantidad nueva)
    const targetCompra = id_compra || originalDetalle.id_compra;
    const newSubtotal = targetCantidad * targetPrecio;
    const updateTargetCompraSql = `
      UPDATE compras_insumos 
      SET monto_total = monto_total + $1 
      WHERE id_compra = $2
    `;
    await client.query(updateTargetCompraSql, [newSubtotal, targetCompra]);

    // Ejecutar el update
    const updatedDetalle = await DetalleCompra.update(id_detalle, {
      id_compra: targetCompra,
      id_insumo: targetInsumo,
      cantidad: targetCantidad,
      precio_unitario: targetPrecio
    });

    await client.query('COMMIT');
    res.status(200).json({ success: true, data: updatedDetalle });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de actualización de detalle compra:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.deleteDetalleCompra = async (req, res) => {
  const id_detalle = req.params.id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener detalle actual
    const originalDetalle = await DetalleCompra.findById(id_detalle);
    if (!originalDetalle) {
      return res.status(404).json({ success: false, message: 'Detalle de compra no encontrado.' });
    }

    // 1. Restar la cantidad del stock del insumo
    const restoreInsumoSql = `
      UPDATE insumos 
      SET cantidad_stock = cantidad_stock - $1 
      WHERE id_insumo = $2
    `;
    await client.query(restoreInsumoSql, [originalDetalle.cantidad, originalDetalle.id_insumo]);

    // 2. Restar el subtotal del monto_total de la compra
    const subtotal = originalDetalle.cantidad * originalDetalle.precio_unitario;
    const restoreCompraSql = `
      UPDATE compras_insumos 
      SET monto_total = monto_total - $1 
      WHERE id_compra = $2
    `;
    await client.query(restoreCompraSql, [subtotal, originalDetalle.id_compra]);

    // 3. Eliminar el detalle de compra
    const deleted = await DetalleCompra.delete(id_detalle);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Detalle de compra eliminado y stock ajustado.', data: deleted });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de eliminación de detalle compra:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
