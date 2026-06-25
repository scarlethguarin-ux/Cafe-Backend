const db = require('../config/db');

class Empaquetado {
  static async create({ id_produccion, id_producto, cantidad_unidades, fecha_empaque }, client = null) {
    const query = `
      INSERT INTO empaquetado (id_produccion, id_producto, cantidad_unidades, fecha_empaque)
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP))
      RETURNING *
    `;
    const values = [id_produccion, id_producto, cantidad_unidades, fecha_empaque];
    
    const dbClient = client || db;
    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT e.*, pf.nombre_producto, pf.presentacion 
      FROM empaquetado e
      LEFT JOIN productos_finales pf ON e.id_producto = pf.id_producto
      ORDER BY e.id_empaquetado DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT e.*, pf.nombre_producto, pf.presentacion 
      FROM empaquetado e
      LEFT JOIN productos_finales pf ON e.id_producto = pf.id_producto
      WHERE e.id_empaquetado = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { id_produccion, id_producto, cantidad_unidades, fecha_empaque }) {
    const query = `
      UPDATE empaquetado 
      SET id_produccion = COALESCE($1, id_produccion),
          id_producto = COALESCE($2, id_producto),
          cantidad_unidades = COALESCE($3, cantidad_unidades),
          fecha_empaque = COALESCE($4, fecha_empaque)
      WHERE id_empaquetado = $5
      RETURNING *
    `;
    const values = [id_produccion, id_producto, cantidad_unidades, fecha_empaque, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM empaquetado WHERE id_empaquetado = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Empaquetado;
