const db = require('../config/db');

class CompraInsumo {
  static async create({ id_proveedor, monto_total = 0, fecha_compra }) {
    const query = `
      INSERT INTO compras_insumos (id_proveedor, monto_total, fecha_compra)
      VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP))
      RETURNING *
    `;
    const values = [id_proveedor, monto_total, fecha_compra];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT c.*, p.nombre_empresa 
      FROM compras_insumos c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      ORDER BY c.id_compra DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT c.*, p.nombre_empresa 
      FROM compras_insumos c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      WHERE c.id_compra = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { id_proveedor, monto_total, fecha_compra }) {
    const query = `
      UPDATE compras_insumos 
      SET id_proveedor = COALESCE($1, id_proveedor),
          monto_total = COALESCE($2, monto_total),
          fecha_compra = COALESCE($3, fecha_compra)
      WHERE id_compra = $4
      RETURNING *
    `;
    const values = [id_proveedor, monto_total, fecha_compra, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM compras_insumos WHERE id_compra = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = CompraInsumo;
