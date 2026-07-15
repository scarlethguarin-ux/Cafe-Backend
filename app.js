const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['https://cafecolombia1.netlify.app'];

    // Si no hay origen (ej. Postman) o si está en la lista blanca
    // .replace(/\/$/, '') elimina la barra diagonal al final si existe
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Si usas cookies o sesiones, esto es necesario
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de verificación de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor del Backend de Productora de Café activo y funcionando.'
  });
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const rolRoutes = require('./routes/rolRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const trabajadorRoutes = require('./routes/trabajadorRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const insumoRoutes = require('./routes/insumoRoutes');
const compraInsumoRoutes = require('./routes/compraInsumoRoutes');
const detalleCompraRoutes = require('./routes/detalleCompraRoutes');
const loteRoutes = require('./routes/loteRoutes');
const productoFinalRoutes = require('./routes/productoFinalRoutes');
const produccionRoutes = require('./routes/produccionRoutes');
const empaquetadoRoutes = require('./routes/empaquetadoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const detallePedidoRoutes = require('./routes/detallePedidoRoutes');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/trabajadores', trabajadorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/compras', compraInsumoRoutes);
app.use('/api/detalles-compras', detalleCompraRoutes);
app.use('/api/lotes', loteRoutes);
app.use('/api/productos', productoFinalRoutes);
app.use('/api/producciones', produccionRoutes);
app.use('/api/empaquetados', empaquetadoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/detalles-pedidos', detallePedidoRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `La ruta solicitada ${req.originalUrl} no fue encontrada en este servidor.`
  });
});

// Manejo global de errores (500)
app.use((err, req, res, next) => {
  console.error('Error global detectado:', err);
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error inesperado en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
