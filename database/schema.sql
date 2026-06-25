-- ESQUEMA DE BASE DE DATOS - PRODUCTORA DE CAFÉ

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT REFERENCES roles(id_rol) ON DELETE RESTRICT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Trabajadores
CREATE TABLE IF NOT EXISTS trabajadores (
    id_trabajador SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    cargo VARCHAR(100),
    fecha_contratacion DATE,
    telefono VARCHAR(20)
);

-- 4. Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre_razon_social VARCHAR(150) NOT NULL,
    identificacion_fiscal VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion_envio TEXT
);

-- 5. Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    contacto_principal VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT
);

-- 6. Insumos
CREATE TABLE IF NOT EXISTS insumos (
    id_insumo SERIAL PRIMARY KEY,
    id_proveedor INT REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
    nombre_insumo VARCHAR(150) NOT NULL,
    categoria VARCHAR(100),
    unidad_medida VARCHAR(50) NOT NULL,
    cantidad_stock NUMERIC(10, 2) DEFAULT 0.00
);

-- 7. Compras de Insumos
CREATE TABLE IF NOT EXISTS compras_insumos (
    id_compra SERIAL PRIMARY KEY,
    id_proveedor INT REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto_total NUMERIC(12, 2) DEFAULT 0.00
);

-- 8. Detalles de Compras
CREATE TABLE IF NOT EXISTS detalles_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT REFERENCES compras_insumos(id_compra) ON DELETE CASCADE,
    id_insumo INT REFERENCES insumos(id_insumo) ON DELETE RESTRICT,
    cantidad NUMERIC(10, 2) NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL
);

-- 9. Lotes
CREATE TABLE IF NOT EXISTS lotes (
    id_lote SERIAL PRIMARY KEY,
    codigo_lote VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    capacidad_maxima NUMERIC(10, 2) NOT NULL,
    capacidad_actual NUMERIC(10, 2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'Activo'
);

-- 10. Productos Finales
CREATE TABLE IF NOT EXISTS productos_finales (
    id_producto SERIAL PRIMARY KEY,
    nombre_producto VARCHAR(150) NOT NULL,
    presentacion VARCHAR(100),
    peso_gramos INT NOT NULL,
    precio_venta NUMERIC(12, 2) NOT NULL,
    stock_disponible INT DEFAULT 0
);

-- 11. Producción
CREATE TABLE IF NOT EXISTS produccion (
    id_produccion SERIAL PRIMARY KEY,
    id_lote INT REFERENCES lotes(id_lote) ON DELETE RESTRICT,
    id_trabajador INT REFERENCES trabajadores(id_trabajador) ON DELETE SET NULL,
    fecha_produccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cantidad_producida_kg NUMERIC(10, 2) NOT NULL,
    observaciones TEXT
);

-- 12. Empaquetado
CREATE TABLE IF NOT EXISTS empaquetado (
    id_empaquetado SERIAL PRIMARY KEY,
    id_produccion INT REFERENCES produccion(id_produccion) ON DELETE RESTRICT,
    id_producto INT REFERENCES productos_finales(id_producto) ON DELETE RESTRICT,
    cantidad_unidades INT NOT NULL,
    fecha_empaque TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES clientes(id_cliente) ON DELETE SET NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_pedido VARCHAR(50) DEFAULT 'Pendiente',
    monto_total NUMERIC(12, 2) DEFAULT 0.00
);

-- 14. Detalles de Pedidos
CREATE TABLE IF NOT EXISTS detalles_pedidos (
    id_detalle_pedido SERIAL PRIMARY KEY,
    id_pedido INT REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_producto INT REFERENCES productos_finales(id_producto) ON DELETE RESTRICT,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL
);

-- Insertar roles por defecto
INSERT INTO roles (nombre_rol) VALUES ('Administrador') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre_rol) VALUES ('Trabajador') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre_rol) VALUES ('Cliente') ON CONFLICT DO NOTHING;
