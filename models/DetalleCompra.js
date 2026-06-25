const db = require('../config/db');

class DetalleCompra {
  static async create({ id_compra, id_insumo, cantidad, precio_unitario }, client = null) {
    const query = `
      INSERT INTO detalles_compras (id_compra, id_insumo, cantidad, precio_unitario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [id_compra, id_insumo, cantidad, precio_unitario];
    
    // Si se pasa un cliente de conexión para transacciones, lo usamos
    const dbClient = client || db;
    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT dc.*, i.nombre_insumo 
      FROM detalles_compras dc
      LEFT JOIN insumos i ON dc.id_insumo = i.id_insumo
      ORDER BY dc.id_detalle_compra ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT dc.*, i.nombre_insumo 
      FROM detalles_compras dc
      LEFT JOIN insumos i ON dc.id_insumo = i.id_insumo
      WHERE dc.id_detalle_compra = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByCompraId(idCompra) {
    const query = `
      SELECT dc.*, i.nombre_insumo 
      FROM detalles_compras dc
      LEFT JOIN insumos i ON dc.id_insumo = i.id_insumo
      WHERE dc.id_compra = $1
      ORDER BY dc.id_detalle_compra ASC
    `;
    const { rows } = await db.query(query, [idCompra]);
    return rows[0];
  }

  static async update(id, { id_compra, id_insumo, cantidad, precio_unitario }) {
    const query = `
      UPDATE detalles_compras 
      SET id_compra = COALESCE($1, id_compra),
          id_insumo = COALESCE($2, id_insumo),
          cantidad = COALESCE($3, cantidad),
          precio_unitario = COALESCE($4, precio_unitario)
      WHERE id_detalle_compra = $5
      RETURNING *
    `;
    const values = [id_compra, id_insumo, cantidad, precio_unitario, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM detalles_compras WHERE id_detalle_compra = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = DetalleCompra;
