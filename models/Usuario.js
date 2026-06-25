const db = require('../config/db');

class Usuario {
  static async create({ id_rol, email, password_hash, activo = true }) {
    const query = `
      INSERT INTO usuarios (id_rol, email, password_hash, activo) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id_usuario, id_rol, email, fecha_registro, activo
    `;
    const values = [id_rol, email, password_hash, activo];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT u.id_usuario, u.id_rol, r.nombre_rol, u.email, u.fecha_registro, u.activo 
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT u.id_usuario, u.id_rol, r.nombre_rol, u.email, u.fecha_registro, u.activo 
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.id_usuario = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT u.id_usuario, u.id_rol, r.nombre_rol, u.email, u.password_hash, u.activo 
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      WHERE u.email = $1
    `;
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async update(id, { id_rol, email, activo }) {
    const query = `
      UPDATE usuarios 
      SET id_rol = COALESCE($1, id_rol), 
          email = COALESCE($2, email), 
          activo = COALESCE($3, activo) 
      WHERE id_usuario = $4 
      RETURNING id_usuario, id_rol, email, fecha_registro, activo
    `;
    const values = [id_rol, email, activo, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async updatePassword(id, password_hash) {
    const query = `
      UPDATE usuarios 
      SET password_hash = $1 
      WHERE id_usuario = $2 
      RETURNING id_usuario, email
    `;
    const { rows } = await db.query(query, [password_hash, id]);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario, email';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Usuario;
