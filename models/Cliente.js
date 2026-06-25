const db = require('../config/db');

class Cliente {
  static async create({ id_usuario, nombre_razon_social, identificacion_fiscal, telefono, direccion_envio }) {
    const query = `
      INSERT INTO clientes (id_usuario, nombre_razon_social, identificacion_fiscal, telefono, direccion_envio)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id_usuario, nombre_razon_social, identificacion_fiscal, telefono, direccion_envio];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT c.*, u.email, u.activo 
      FROM clientes c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      ORDER BY c.id_cliente ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT c.*, u.email, u.activo 
      FROM clientes c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_cliente = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByUsuarioId(idUsuario) {
    const query = 'SELECT * FROM clientes WHERE id_usuario = $1';
    const { rows } = await db.query(query, [idUsuario]);
    return rows[0];
  }

  static async update(id, { nombre_razon_social, identificacion_fiscal, telefono, direccion_envio }) {
    const query = `
      UPDATE clientes 
      SET nombre_razon_social = COALESCE($1, nombre_razon_social),
          identificacion_fiscal = COALESCE($2, identificacion_fiscal),
          telefono = COALESCE($3, telefono),
          direccion_envio = COALESCE($4, direccion_envio)
      WHERE id_cliente = $5
      RETURNING *
    `;
    const values = [nombre_razon_social, identificacion_fiscal, telefono, direccion_envio, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM clientes WHERE id_cliente = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Cliente;
