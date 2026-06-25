const db = require('../config/db');

class Proveedor {
  static async create({ nombre_empresa, contacto_principal, telefono, email, direccion }) {
    const query = `
      INSERT INTO proveedores (nombre_empresa, contacto_principal, telefono, email, direccion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [nombre_empresa, contacto_principal, telefono, email, direccion];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM proveedores ORDER BY id_proveedor ASC';
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM proveedores WHERE id_proveedor = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { nombre_empresa, contacto_principal, telefono, email, direccion }) {
    const query = `
      UPDATE proveedores 
      SET nombre_empresa = COALESCE($1, nombre_empresa),
          contacto_principal = COALESCE($2, contacto_principal),
          telefono = COALESCE($3, telefono),
          email = COALESCE($4, email),
          direccion = COALESCE($5, direccion)
      WHERE id_proveedor = $6
      RETURNING *
    `;
    const values = [nombre_empresa, contacto_principal, telefono, email, direccion, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM proveedores WHERE id_proveedor = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Proveedor;
