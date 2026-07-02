const db = require('../config/db');

class ProductoFinal {
  static async create({ nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible = 0, imagen = null }) {
    const query = `
      INSERT INTO productos_finales (nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible, imagen)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible, imagen];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM productos_finales ORDER BY id_producto ASC';
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM productos_finales WHERE id_producto = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible, imagen }) {
    const query = `
      UPDATE productos_finales 
      SET nombre_producto = COALESCE($1, nombre_producto),
          presentacion = COALESCE($2, presentacion),
          peso_gramos = COALESCE($3, peso_gramos),
          precio_venta = COALESCE($4, precio_venta),
          stock_disponible = COALESCE($5, stock_disponible),
          imagen = COALESCE($6, imagen)
      WHERE id_producto = $7
      RETURNING *
    `;
    const values = [nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible, imagen, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM productos_finales WHERE id_producto = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = ProductoFinal;
