const db = require('../config/db');

class Trabajador {
  static async create({ id_usuario, nombre_completo, cedula, cargo, fecha_contratacion, telefono }) {
    const query = `
      INSERT INTO trabajadores (id_usuario, nombre_completo, cedula, cargo, fecha_contratacion, telefono)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [id_usuario, nombre_completo, cedula, cargo, fecha_contratacion, telefono];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT t.*, u.email, u.activo 
      FROM trabajadores t
      LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
      ORDER BY t.id_trabajador ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT t.*, u.email, u.activo 
      FROM trabajadores t
      LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
      WHERE t.id_trabajador = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByUsuarioId(idUsuario) {
    const query = 'SELECT * FROM trabajadores WHERE id_usuario = $1';
    const { rows } = await db.query(query, [idUsuario]);
    return rows[0];
  }

  static async update(id, { nombre_completo, cedula, cargo, fecha_contratacion, telefono }) {
    const query = `
      UPDATE trabajadores 
      SET nombre_completo = COALESCE($1, nombre_completo),
          cedula = COALESCE($2, cedula),
          cargo = COALESCE($3, cargo),
          fecha_contratacion = COALESCE($4, fecha_contratacion),
          telefono = COALESCE($5, telefono)
      WHERE id_trabajador = $6
      RETURNING *
    `;
    const values = [nombre_completo, cedula, cargo, fecha_contratacion, telefono, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM trabajadores WHERE id_trabajador = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Trabajador;
