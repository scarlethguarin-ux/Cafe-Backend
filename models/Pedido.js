const db = require('../config/db');

class Pedido {
  static async create({ id_cliente, estado_pedido = 'Pendiente', monto_total = 0, fecha_pedido }, client = null) {
    const query = `
      INSERT INTO pedidos (id_cliente, estado_pedido, monto_total, fecha_pedido)
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP))
      RETURNING *
    `;
    const values = [id_cliente, estado_pedido, monto_total, fecha_pedido];
    
    const dbClient = client || db;
    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT p.*, c.nombre_razon_social 
      FROM pedidos p
      LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
      ORDER BY p.id_pedido DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, c.nombre_razon_social 
      FROM pedidos p
      LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
      WHERE p.id_pedido = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { id_cliente, estado_pedido, monto_total, fecha_pedido }, client = null) {
    const query = `
      UPDATE pedidos 
      SET id_cliente = COALESCE($1, id_cliente),
          estado_pedido = COALESCE($2, estado_pedido),
          monto_total = COALESCE($3, monto_total),
          fecha_pedido = COALESCE($4, fecha_pedido)
      WHERE id_pedido = $5
      RETURNING *
    `;
    const values = [id_cliente, estado_pedido, monto_total, fecha_pedido, id];
    const dbClient = client || db;
    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM pedidos WHERE id_pedido = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = Pedido;
