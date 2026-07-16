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
    // 1. Extraer query params
    const { 
      nombre, 
      presentacion, 
      precio_min, 
      precio_max, 
      page = 1, 
      limit = 10 
    } = req.query;

    // 2. Calcular el offset para la paginación
    const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    // 3. Ejecutar la búsqueda en el modelo
    const { rows: productos, totalItems } = await ProductoFinal.findAll({
      nombre,
      presentacion,
      precio_min: precio_min ? parseFloat(precio_min) : undefined,
      precio_max: precio_max ? parseFloat(precio_max) : undefined,
      limit: limitNumber,
      offset
    });

    // 4. Calcular el total de páginas
    const totalPages = Math.ceil(totalItems / limitNumber);

    // 5. Devolver la respuesta con data y pagination sin romper el frontend
    res.status(200).json({ 
      success: true, 
      data: productos,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber
      }
    });
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
