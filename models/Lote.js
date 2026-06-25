const db = require('../config/db');

class Lote {
  static async create({ codigo_lote, descripcion, capacidad_maxima, capacidad_actual = 0, estado = 'Activo' }) {
    const query = `
      INSERT INTO lotes (codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM lotes ORDER BY id_lote ASC';
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM lotes WHERE id_lote = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado }) {
    const query = `
      UPDATE lotes 
      SET codigo_lote = COALESCE($1, codigo_lote),
          descripcion = COALESCE($2, descripcion),
          capacidad_maxima = COALESCE($3, capacidad_maxima),
          capacidad_actual = COALESCE($4, capacidad_actual),
          estado = COALESCE($5, estado)
      WHERE id_lote = $6
      RETURNING *
    `;
    const values = [codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM lotes WHERE id_lote = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Lote;
