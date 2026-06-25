const fs = require('fs');
const path = require('path');
const db = require('./config/db');
const bcrypt = require('bcryptjs');

// Importar Controladores para testeo directo
const detalleCompraController = require('./controllers/detalleCompraController');
const produccionController = require('./controllers/produccionController');
const empaquetadoController = require('./controllers/empaquetadoController');
const detallePedidoController = require('./controllers/detallePedidoController');

// Simulación de objetos Request y Response para Express
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runValidation = async () => {
  console.log('--- INICIANDO SUITE DE INTEGRACIÓN Y VALIDACIÓN ---');
  
  try {
    // 1. Inicializar Tablas leyendo schema.sql
    console.log('\n[Paso 1] Creando tablas desde database/schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Separar queries por punto y coma (limpieza básica para pg driver)
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);
      
    for (const query of queries) {
      await db.query(query);
    }
    console.log('✓ Tablas e inserciones básicas de roles creadas con éxito.');

    // Limpiar registros previos de prueba
    console.log('\n[Paso 2] Limpiando base de datos para pruebas...');
    await db.query('TRUNCATE detalles_pedidos, pedidos, empaquetado, produccion, productos_finales, lotes, detalles_compras, compras_insumos, insumos, proveedores, trabajadores, clientes, usuarios RESTART IDENTITY CASCADE');

    // 2. Insertar Datos Semilla
    console.log('\n[Paso 3] Insertando registros semilla para la validación...');
    
    // Rol
    const adminRol = await db.query("INSERT INTO roles (nombre_rol) VALUES ('Administrador') ON CONFLICT DO NOTHING RETURNING id_rol");
    const idRolAdmin = adminRol.rows[0]?.id_rol || 1;

    // Usuario (Seeding admin@cafe.com with bcrypt hash of admin123)
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);

    const userRes = await db.query(
      `INSERT INTO usuarios (id_rol, email, password_hash, activo) 
       VALUES ($1, 'admin@cafe.com', $2, true) RETURNING id_usuario`,
      [idRolAdmin, adminHash]
    );
    const idUsuario = userRes.rows[0].id_usuario;

    // Trabajador y Cliente
    const trabajadorRes = await db.query(
      `INSERT INTO trabajadores (id_usuario, nombre_completo, cedula, cargo, fecha_contratacion, telefono) 
       VALUES ($1, 'Juan Pérez', '12345678-9', 'Supervisor Agrícola', '2026-01-01', '555-0100') RETURNING id_trabajador`,
      [idUsuario]
    );
    const idTrabajador = trabajadorRes.rows[0].id_trabajador;

    const clienteRes = await db.query(
      `INSERT INTO clientes (id_usuario, nombre_razon_social, identificacion_fiscal, telefono, direccion_envio) 
       VALUES ($1, 'Distribuidora Café Gourmet', '98765432-1', '555-0200', 'Av. Central 123') RETURNING id_cliente`,
      [idUsuario]
    );
    const idCliente = clienteRes.rows[0].id_cliente;

    // Proveedor
    const provRes = await db.query(
      `INSERT INTO proveedores (nombre_empresa, contacto_principal, telefono, email, direccion) 
       VALUES ('Sacos del Campo S.A.', 'Don Alberto', '555-0300', 'ventas@sacos.com', 'Zona Industrial Sur') RETURNING id_proveedor`
    );
    const idProveedor = provRes.rows[0].id_proveedor;

    // Insumo
    const insumoRes = await db.query(
      `INSERT INTO insumos (id_proveedor, nombre_insumo, categoria, unidad_medida, cantidad_stock) 
       VALUES ($1, 'Saco de Yute Estándar', 'Empaque', 'Unidades', 10.00) RETURNING id_insumo`,
      [idProveedor]
    );
    const idInsumo = insumoRes.rows[0].id_insumo;

    // Compra
    const compraRes = await db.query(
      `INSERT INTO compras_insumos (id_proveedor, monto_total) 
       VALUES ($1, 0.00) RETURNING id_compra`,
      [idProveedor]
    );
    const idCompra = compraRes.rows[0].id_compra;

    // Lote
    const loteRes = await db.query(
      `INSERT INTO lotes (codigo_lote, descripcion, capacidad_maxima, capacidad_actual, estado) 
       VALUES ('LOTE-ARABICA-01', 'Lote de Café Arábica en falda de montaña', 500.00, 100.00, 'Activo') RETURNING id_lote`
    );
    const idLote = loteRes.rows[0].id_lote;

    // Producto Final
    const prodRes = await db.query(
      `INSERT INTO productos_finales (nombre_producto, presentacion, peso_gramos, precio_venta, stock_disponible) 
       VALUES ('Café Especial Premium', 'Molido bolsa de lujo', 500, 15.50, 50) RETURNING id_producto`
    );
    const idProducto = prodRes.rows[0].id_producto;

    // Pedido
    const pedidoRes = await db.query(
      `INSERT INTO pedidos (id_cliente, estado_pedido, monto_total) 
       VALUES ($1, 'Pendiente', 0.00) RETURNING id_pedido`,
      [idCliente]
    );
    const idPedido = pedidoRes.rows[0].id_pedido;

    console.log('✓ Registros semilla insertados exitosamente.');

    // 3. Ejecutar Pruebas de Transacciones
    console.log('\n[Paso 4] Iniciando pruebas unitarias de controladores transaccionales...');

    // ----------------------------------------------------
    // TEST 1: Módulo de Insumos (Detalle de Compra)
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Sumar stock al registrar detalle de compra ---');
    const req1 = {
      body: {
        id_compra: idCompra,
        id_insumo: idInsumo,
        cantidad: 15,
        precio_unitario: 2.50
      }
    };
    const res1 = mockResponse();
    await detalleCompraController.createDetalleCompra(req1, res1);

    // Verificar cantidad de stock actualizada
    const checkInsumoStock = await db.query('SELECT cantidad_stock FROM insumos WHERE id_insumo = $1', [idInsumo]);
    const stockActualInsumo = parseFloat(checkInsumoStock.rows[0].cantidad_stock);

    console.log(`Respuesta controlador: Código ${res1.statusCode}`);
    console.log(`Stock Inicial Insumo: 10.00 | Cantidad comprada: 15.00`);
    console.log(`Stock Actual en Base de Datos: ${stockActualInsumo}`);
    
    if (stockActualInsumo === 25.00) {
      console.log('✓ TEST 1 EXITOSO: El stock del insumo aumentó correctamente.');
    } else {
      console.error('✗ TEST 1 FALLIDO: El stock del insumo no coincide con la suma.');
    }

    // ----------------------------------------------------
    // TEST 2: Módulo Agrícola (Producción) - Caso Fallido por Capacidad
    // ----------------------------------------------------
    console.log('\n--- TEST 2A: Validar exceso de capacidad máxima del lote (Debe rebotar) ---');
    // Lote actual: Capacidad máxima 500.00, Capacidad actual 100.00. 
    // Si agregamos 450.00 kg, daría 550.00 kg (Excede 500) -> Debe fallar
    const req2A = {
      body: {
        id_lote: idLote,
        id_trabajador: idTrabajador,
        cantidad_producida_kg: 450.00,
        observaciones: 'Prueba de desborde de lote'
      }
    };
    const res2A = mockResponse();
    await produccionController.createProduccion(req2A, res2A);

    console.log(`Respuesta controlador: Código ${res2A.statusCode}`);
    console.log(`Mensaje retornado: ${res2A.body.message}`);

    if (res2A.statusCode === 400) {
      console.log('✓ TEST 2A EXITOSO: El sistema rechazó la producción que excede el límite.');
    } else {
      console.error('✗ TEST 2A FALLIDO: El sistema permitió ingresar exceso de capacidad.');
    }

    // ----------------------------------------------------
    // TEST 2B: Módulo Agrícola (Producción) - Caso Exitoso
    // ----------------------------------------------------
    console.log('\n--- TEST 2B: Registro exitoso de producción dentro del límite de capacidad ---');
    // Si agregamos 150.00 kg, daría 250.00 kg (Menor a 500) -> Debe ser exitoso
    const req2B = {
      body: {
        id_lote: idLote,
        id_trabajador: idTrabajador,
        cantidad_producida_kg: 150.00,
        observaciones: 'Registro válido de cosecha'
      }
    };
    const res2B = mockResponse();
    await produccionController.createProduccion(req2B, res2B);

    const checkLoteCapacidad = await db.query('SELECT capacidad_actual FROM lotes WHERE id_lote = $1', [idLote]);
    const capacidadActualLote = parseFloat(checkLoteCapacidad.rows[0].capacidad_actual);
    
    console.log(`Respuesta controlador: Código ${res2B.statusCode}`);
    console.log(`Capacidad Inicial Lote: 100.00 | Cantidad producida: 150.00`);
    console.log(`Capacidad Actual en Base de Datos: ${capacidadActualLote}`);

    if (res2B.statusCode === 201 && capacidadActualLote === 250.00) {
      console.log('✓ TEST 2B EXITOSO: Producción registrada y capacidad del lote incrementada.');
    } else {
      console.error('✗ TEST 2B FALLIDO: Error al procesar producción válida.');
    }

    // Guardamos la id_produccion para el test de empaque
    const idProduccion = res2B.body.data.id_produccion;

    // ----------------------------------------------------
    // TEST 3: Módulo de Empaque (Empaquetado)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Sumar unidades al registrar empaquetado ---');
    const req3 = {
      body: {
        id_produccion: idProduccion,
        id_producto: idProducto,
        cantidad_unidades: 30
      }
    };
    const res3 = mockResponse();
    await empaquetadoController.createEmpaquetado(req3, res3);

    const checkProdStock = await db.query('SELECT stock_disponible FROM productos_finales WHERE id_producto = $1', [idProducto]);
    const stockActualProd = parseInt(checkProdStock.rows[0].stock_disponible);

    console.log(`Respuesta controlador: Código ${res3.statusCode}`);
    console.log(`Stock Inicial Producto: 50 | Cantidad empaquetada: 30`);
    console.log(`Stock Actual en Base de Datos: ${stockActualProd}`);

    if (stockActualProd === 80) {
      console.log('✓ TEST 3 EXITOSO: Unidades sumadas correctamente al inventario del producto.');
    } else {
      console.error('✗ TEST 3 FALLIDO: El stock del producto no se actualizó correctamente.');
    }

    // ----------------------------------------------------
    // TEST 4A: Módulo de Ventas (Detalle de Pedido) - Caso Fallido por Stock Insuficiente
    // ----------------------------------------------------
    console.log('\n--- TEST 4A: Detalle de pedido con stock insuficiente (Debe rebotar) ---');
    // Stock actual: 80. Si solicitamos 100 -> Debe fallar y dar error 400.
    const req4A = {
      body: {
        id_pedido: idPedido,
        id_producto: idProducto,
        cantidad: 100,
        precio_unitario: 15.50
      }
    };
    const res4A = mockResponse();
    await detallePedidoController.createDetallePedido(req4A, res4A);

    console.log(`Respuesta controlador: Código ${res4A.statusCode}`);
    console.log(`Mensaje retornado: ${res4A.body.message}`);

    if (res4A.statusCode === 400) {
      console.log('✓ TEST 4A EXITOSO: El sistema rechazó la orden y abortó por stock insuficiente.');
    } else {
      console.error('✗ TEST 4A FALLIDO: Se permitió vender sin stock disponible.');
    }

    // ----------------------------------------------------
    // TEST 4B: Módulo de Ventas (Detalle de Pedido) - Caso Exitoso
    // ----------------------------------------------------
    console.log('\n--- TEST 4B: Detalle de pedido válido (Debe descontar stock) ---');
    // Stock actual: 80. Si pedimos 12 -> Debe ser exitoso, quedando 68 en stock.
    const req4B = {
      body: {
        id_pedido: idPedido,
        id_producto: idProducto,
        cantidad: 12,
        precio_unitario: 15.50
      }
    };
    const res4B = mockResponse();
    await detallePedidoController.createDetallePedido(req4B, res4B);

    const checkFinalProdStock = await db.query('SELECT stock_disponible FROM productos_finales WHERE id_producto = $1', [idProducto]);
    const finalStockProd = parseInt(checkFinalProdStock.rows[0].stock_disponible);

    console.log(`Respuesta controlador: Código ${res4B.statusCode}`);
    console.log(`Stock Inicial Producto: 80 | Cantidad vendida: 12`);
    console.log(`Stock Actual en Base de Datos: ${finalStockProd}`);

    if (res4B.statusCode === 201 && finalStockProd === 68) {
      console.log('✓ TEST 4B EXITOSO: Venta exitosa. Stock decrementado con precisión.');
    } else {
      console.error('✗ TEST 4B FALLIDO: Error al descontar inventario o procesar la venta.');
    }

    console.log('\n--- VALIDACIÓN FINALIZADA CON ÉXITO ---');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ ERROR CRÍTICO DURANTE LA VALIDACIÓN:', error);
    process.exit(1);
  }
};

runValidation();
