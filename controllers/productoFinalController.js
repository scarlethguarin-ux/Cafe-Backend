const ProductoFinal = require('../models/ProductoFinal');

exports.createProducto = async (req, res) => {
  const { nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible, imagen } = req.body;
  if (!nombre_producto || isNaN(peso_gramos) || isNaN(precio_venta)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios o formato inválido (nombre_producto, peso_gramos, precio_venta).' });
  }

  try {
    const producto = await ProductoFinal.create({
      nombre_producto,
      presentacion,
      peso_gramos,
      precio_venta,
      stock_disponible: stock_disponible || 0,
      imagen
    });
    res.status(201).json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllProductos = async (req, res) => {
  try {
    const productos = await ProductoFinal.findAll();
    res.status(200).json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const producto = await ProductoFinal.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }
    res.status(200).json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProducto = async (req, res) => {
  const { nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible, imagen } = req.body;

  try {
    const producto = await ProductoFinal.update(req.params.id, {
      nombre_producto,
      presentacion,
      peso_gramos,
      precio_venta,
      stock_disponible,
      imagen
    });
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }
    res.status(200).json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const producto = await ProductoFinal.delete(req.params.id);
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Producto eliminado con éxito.', data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
