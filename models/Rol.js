const db = require('../config/db');

class Rol {
  static async create({ nombre_rol }) {
    const query = 'INSERT INTO roles (nombre_rol) VALUES ($1) RETURNING *';
    const values = [nombre_rol];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM roles ORDER BY id_rol ASC';
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM roles WHERE id_rol = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { nombre_rol }) {
    const query = 'UPDATE roles SET nombre_rol = $1 WHERE id_rol = $2 RETURNING *';
    const values = [nombre_rol, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM roles WHERE id_rol = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Rol;
