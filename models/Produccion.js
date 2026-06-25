const db = require('../config/db');

class Produccion {
  static async create({ id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion }, client = null) {
    const query = `
      INSERT INTO produccion (id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion)
      VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
      RETURNING *
    `;
    const values = [id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion];
    
    const dbClient = client || db;
    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT p.*, l.codigo_lote, t.nombre_completo AS nombre_trabajador 
      FROM produccion p
      LEFT JOIN lotes l ON p.id_lote = l.id_lote
      LEFT JOIN trabajadores t ON p.id_trabajador = t.id_trabajador
      ORDER BY p.id_produccion DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, l.codigo_lote, t.nombre_completo AS nombre_trabajador 
      FROM produccion p
      LEFT JOIN lotes l ON p.id_lote = l.id_lote
      LEFT JOIN trabajadores t ON p.id_trabajador = t.id_trabajador
      WHERE p.id_produccion = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion }) {
    const query = `
      UPDATE produccion 
      SET id_lote = COALESCE($1, id_lote),
          id_trabajador = COALESCE($2, id_trabajador),
          cantidad_producida_kg = COALESCE($3, cantidad_producida_kg),
          observaciones = COALESCE($4, observaciones),
          fecha_produccion = COALESCE($5, fecha_produccion)
      WHERE id_produccion = $6
      RETURNING *
    `;
    const values = [id_lote, id_trabajador, cantidad_producida_kg, observaciones, fecha_produccion, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM produccion WHERE id_produccion = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Produccion;
