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

  static async findAll({ nombre, presentacion, precio_min, precio_max, limit = 10, offset = 0 } = {}) {
    let query = 'SELECT * FROM productos_finales WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM productos_finales WHERE 1=1';
    const values = [];

    if (nombre) {
      values.push(`%${nombre}%`);
      query += ` AND nombre_producto ILIKE $${values.length}`;
      countQuery += ` AND nombre_producto ILIKE $${values.length}`;
    }

    if (presentacion) {
      values.push(presentacion);
      query += ` AND presentacion = $${values.length}`;
      countQuery += ` AND presentacion = $${values.length}`;
    }

    if (precio_min) {
      values.push(precio_min);
      query += ` AND precio_venta >= $${values.length}`;
      countQuery += ` AND precio_venta >= $${values.length}`;
    }

    if (precio_max) {
      values.push(precio_max);
      query += ` AND precio_venta <= $${values.length}`;
      countQuery += ` AND precio_venta <= $${values.length}`;
    }

    // Agregar limit y offset a la query de datos
    query += ` ORDER BY id_producto ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    
    // Obtener total de items
    const countResult = await db.query(countQuery, values);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    // Obtener datos paginados
    const queryValues = [...values, limit, offset];
    const { rows } = await db.query(query, queryValues);

    return { rows, totalItems };
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
