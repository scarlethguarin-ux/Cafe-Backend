const db = require('../config/db');
const Empaquetado = require('../models/Empaquetado');

exports.createEmpaquetado = async (req, res) => {
  const { id_produccion, id_producto, cantidad_unidades, fecha_empaque } = req.body;
  if (!id_produccion || !id_producto || isNaN(cantidad_unidades)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios o formato inválido (id_produccion, id_producto, cantidad_unidades).' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Crear registro de empaquetado
    const empaquetado = await Empaquetado.create({
      id_produccion,
      id_producto,
      cantidad_unidades,
      fecha_empaque
    }, client);

    // 2. Sumar cantidad_unidades al stock_disponible del producto_final
    const updateProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible + $1 
      WHERE id_producto = $2 
      RETURNING *
    `;
    const productResult = await client.query(updateProductSql, [cantidad_unidades, id_producto]);
    if (productResult.rowCount === 0) {
      throw new Error(`Producto final con id ${id_producto} no existe.`);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: empaquetado });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de creación de empaquetado:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.getAllEmpaquetados = async (req, res) => {
  try {
    const empaquetados = await Empaquetado.findAll();
    res.status(200).json({ success: true, data: empaquetados });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEmpaquetadoById = async (req, res) => {
  try {
    const empaquetado = await Empaquetado.findById(req.params.id);
    if (!empaquetado) {
      return res.status(404).json({ success: false, message: 'Registro de empaquetado no encontrado.' });
    }
    res.status(200).json({ success: true, data: empaquetado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateEmpaquetado = async (req, res) => {
  const { id_produccion, id_producto, cantidad_unidades, fecha_empaque } = req.body;
  const id_empaquetado = req.params.id;

  if (cantidad_unidades !== undefined && isNaN(cantidad_unidades)) {
    return res.status(400).json({ success: false, message: 'La cantidad de unidades debe ser numérica.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener original
    const originalEmp = await Empaquetado.findById(id_empaquetado);
    if (!originalEmp) {
      return res.status(404).json({ success: false, message: 'Empaquetado no encontrado.' });
    }

    const targetProduct = id_producto || originalEmp.id_producto;
    const targetCantidad = cantidad_unidades !== undefined ? parseInt(cantidad_unidades) : originalEmp.cantidad_unidades;

    // 1. Restar stock de producto original (revertir cantidad anterior)
    const restoreProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible - $1 
      WHERE id_producto = $2
    `;
    await client.query(restoreProductSql, [originalEmp.cantidad_unidades, originalEmp.id_producto]);

    // 2. Sumar stock al producto destino (aplicar nueva cantidad)
    const updateProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible + $1 
      WHERE id_producto = $2
    `;
    const productResult = await client.query(updateProductSql, [targetCantidad, targetProduct]);
    if (productResult.rowCount === 0) {
      throw new Error(`Producto destino con id ${targetProduct} no existe.`);
    }

    // 3. Ejecutar update del empaquetado
    const updated = await Empaquetado.update(id_empaquetado, {
      id_produccion: id_produccion || originalEmp.id_produccion,
      id_producto: targetProduct,
      cantidad_unidades: targetCantidad,
      fecha_empaque
    });

    await client.query('COMMIT');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de actualización de empaquetado:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.deleteEmpaquetado = async (req, res) => {
  const id_empaquetado = req.params.id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener actual
    const originalEmp = await Empaquetado.findById(id_empaquetado);
    if (!originalEmp) {
      return res.status(404).json({ success: false, message: 'Empaquetado no encontrado.' });
    }

    // 1. Restar la cantidad de stock del producto final
    const restoreProductSql = `
      UPDATE productos_finales 
      SET stock_disponible = stock_disponible - $1 
      WHERE id_producto = $2
    `;
    await client.query(restoreProductSql, [originalEmp.cantidad_unidades, originalEmp.id_producto]);

    // 2. Eliminar el empaquetado
    const deleted = await Empaquetado.delete(id_empaquetado);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Registro de empaquetado eliminado y stock actualizado.', data: deleted });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de eliminación de empaquetado:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
