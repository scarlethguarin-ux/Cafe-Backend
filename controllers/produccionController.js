const db = require('../config/db');
const Produccion = require('../models/Produccion');
const Lote = require('../models/Lote');

exports.createProduccion = async (req, res) => {
  const { id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion } = req.body;
  if (!id_lote || isNaN(cantidad_producida_kg)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios o formato inválido (id_lote, cantidad_producida_kg).' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener datos del lote (bloquear para evitar condiciones de carrera)
    const loteQuery = 'SELECT * FROM lotes WHERE id_lote = $1 FOR UPDATE';
    const loteRes = await client.query(loteQuery, [id_lote]);
    
    if (loteRes.rowCount === 0) {
      throw new Error(`El lote con id ${id_lote} no existe.`);
    }

    const lote = loteRes.rows[0];
    const nuevaCapacidad = parseFloat(lote.capacidad_actual) + parseFloat(cantidad_producida_kg);
    
    // 2. Validar que la suma no exceda la capacidad_maxima del lote
    if (nuevaCapacidad > parseFloat(lote.capacidad_maxima)) {
      return res.status(400).json({
        success: false,
        message: `Operación abortada: La cantidad producida (${cantidad_producida_kg} kg) excede la capacidad máxima disponible del lote (Capacidad actual: ${lote.capacidad_actual} kg, Capacidad máxima: ${lote.capacidad_maxima} kg).`
      });
    }

    // 3. Crear el registro de producción
    const produccion = await Produccion.create({
      id_lote,
      id_trabajador,
      cantidad_producida_kg,
      observaciones,
      fecha_produccion
    }, client);

    // 4. Actualizar la capacidad actual del lote
    const updateLoteSql = 'UPDATE lotes SET capacidad_actual = $1 WHERE id_lote = $2';
    await client.query(updateLoteSql, [nuevaCapacidad, id_lote]);

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: produccion });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de creación de producción:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.getAllProducciones = async (req, res) => {
  try {
    const producciones = await Produccion.findAll();
    res.status(200).json({ success: true, data: producciones });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProduccionById = async (req, res) => {
  try {
    const produccion = await Produccion.findById(req.params.id);
    if (!produccion) {
      return res.status(404).json({ success: false, message: 'Registro de producción no encontrado.' });
    }
    res.status(200).json({ success: true, data: produccion });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduccion = async (req, res) => {
  const { id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion } = req.body;
  const id_produccion = req.params.id;

  if (cantidad_producida_kg !== undefined && isNaN(cantidad_producida_kg)) {
    return res.status(400).json({ success: false, message: 'La cantidad producida debe ser un número válido.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener producción original
    const originalProd = await Produccion.findById(id_produccion);
    if (!originalProd) {
      return res.status(404).json({ success: false, message: 'Producción no encontrada.' });
    }

    const targetLoteId = id_lote || originalProd.id_lote;
    const targetCantidad = cantidad_producida_kg !== undefined ? parseFloat(cantidad_producida_kg) : parseFloat(originalProd.cantidad_producida_kg);

    // 1. Descontar cantidad anterior del lote original
    const restoreLoteSql = 'UPDATE lotes SET capacidad_actual = capacidad_actual - $1 WHERE id_lote = $2';
    await client.query(restoreLoteSql, [originalProd.cantidad_producida_kg, originalProd.id_lote]);

    // 2. Obtener y bloquear el lote destino
    const loteQuery = 'SELECT * FROM lotes WHERE id_lote = $1 FOR UPDATE';
    const loteRes = await client.query(loteQuery, [targetLoteId]);
    if (loteRes.rowCount === 0) {
      throw new Error(`El lote destino con id ${targetLoteId} no existe.`);
    }

    const loteDestino = loteRes.rows[0];
    const nuevaCapacidad = parseFloat(loteDestino.capacidad_actual) + targetCantidad;

    // 3. Validar capacidad máxima en lote destino
    if (nuevaCapacidad > parseFloat(loteDestino.capacidad_maxima)) {
      // Si falla, hacemos rollback para no alterar nada y respondemos con error 400
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Operación abortada: La nueva cantidad (${targetCantidad} kg) excede la capacidad máxima disponible en el lote destino.`
      });
    }

    // 4. Actualizar lote destino con nueva cantidad
    const updateLoteSql = 'UPDATE lotes SET capacidad_actual = capacidad_actual + $1 WHERE id_lote = $2';
    await client.query(updateLoteSql, [targetCantidad, targetLoteId]);

    // 5. Actualizar producción
    const updatedProd = await Produccion.update(id_produccion, {
      id_lote: targetLoteId,
      id_trabajador,
      cantidad_producida_kg: targetCantidad,
      observaciones,
      fecha_produccion
    });

    await client.query('COMMIT');
    res.status(200).json({ success: true, data: updatedProd });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de actualización de producción:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

exports.deleteProduccion = async (req, res) => {
  const id_produccion = req.params.id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Obtener producción actual
    const originalProd = await Produccion.findById(id_produccion);
    if (!originalProd) {
      return res.status(404).json({ success: false, message: 'Producción no encontrada.' });
    }

    // 1. Restar la cantidad producida del capacidad_actual del lote correspondiente
    const restoreLoteSql = 'UPDATE lotes SET capacidad_actual = capacidad_actual - $1 WHERE id_lote = $2';
    await client.query(restoreLoteSql, [originalProd.cantidad_producida_kg, originalProd.id_lote]);

    // 2. Eliminar la producción
    const deleted = await Produccion.delete(id_produccion);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Registro de producción eliminado y lote actualizado.', data: deleted });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de eliminación de producción:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
