const db = require('../config/db');

class DetallePedido {
  static async create({ id_pedido, id_producto, cantidad, precio_unitario }, client = null) {
    const query = `
      INSERT INTO detalles_pedidos (id_pedido, id_producto, cantidad, precio_unitario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [id_pedido, id_producto, cantidad, precio_unitario];
    
    const dbClient = client || db;
    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT dp.*, pf.nombre_producto, pf.presentacion 
      FROM detalles_pedidos dp
      LEFT JOIN productos_finales pf ON dp.id_producto = pf.id_producto
      ORDER BY dp.id_detalle_pedido ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT dp.*, pf.nombre_producto, pf.presentacion 
      FROM detalles_pedidos dp
      LEFT JOIN productos_finales pf ON dp.id_producto = pf.id_producto
      WHERE dp.id_detalle_pedido = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByPedidoId(idPedido) {
    const query = `
      SELECT dp.*, pf.nombre_producto, pf.presentacion 
      FROM detalles_pedidos dp
      LEFT JOIN productos_finales pf ON dp.id_producto = pf.id_producto
      WHERE dp.id_pedido = $1
      ORDER BY dp.id_detalle_pedido ASC
    `;
    const { rows } = await db.query(query, [idPedido]);
    return rows;
  }

  static async update(id, { id_pedido, id_producto, cantidad, precio_unitario }) {
    const query = `
      UPDATE detalles_pedidos 
      SET id_pedido = COALESCE($1, id_pedido),
          id_producto = COALESCE($2, id_producto),
          cantidad = COALESCE($3, cantidad),
          precio_unitario = COALESCE($4, precio_unitario)
      WHERE id_detalle_pedido = $5
      RETURNING *
    `;
    const values = [id_pedido, id_producto, cantidad, precio_unitario, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM detalles_pedidos WHERE id_detalle_pedido = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = DetallePedido;
