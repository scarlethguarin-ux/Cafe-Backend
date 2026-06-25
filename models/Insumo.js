const db = require('../config/db');

class Insumo {
  static async create({ id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock = 0 }) {
    const query = `
      INSERT INTO insumos (id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT i.*, p.nombre_empresa 
      FROM insumos i
      LEFT JOIN proveedores p ON i.id_proveedor = p.id_proveedor
      ORDER BY i.id_insumo ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT i.*, p.nombre_empresa 
      FROM insumos i
      LEFT JOIN proveedores p ON i.id_proveedor = p.id_proveedor
      WHERE i.id_insumo = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock }) {
    const query = `
      UPDATE insumos 
      SET id_proveedor = COALESCE($1, id_proveedor),
          nombre_insumo = COALESCE($2, nombre_insumo),
          categoria = COALESCE($3, categoria),
          unidad_medida = COALESCE($4, unidad_medida),
          cantidad_stock = COALESCE($5, cantidad_stock)
      WHERE id_insumo = $6
      RETURNING *
    `;
    const values = [id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM insumos WHERE id_insumo = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Insumo;
