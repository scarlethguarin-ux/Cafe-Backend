const { z } = require('zod');

// Helper to preprocess empty string values to null for optional nullable fields
const emptyToNull = (schema) => z.preprocess((val) => (val === "" ? null : val), schema);

// 1. Roles
const rolSchema = z.object({
  nombre_rol: z.string({
    required_error: "El nombre del rol es requerido.",
    invalid_type_error: "El nombre del rol debe ser un texto."
  })
  .min(1, "El nombre del rol no puede estar vacío.")
  .max(50, "El nombre del rol no puede exceder los 50 caracteres.")
});

// 2. Usuarios / Auth
const usuarioSchema = z.object({
  id_rol: z.number({
    required_error: "El id_rol es requerido.",
    invalid_type_error: "El id_rol debe ser un número."
  }).int().positive("El id_rol debe ser un número positivo."),
  email: z.string({
    required_error: "El email es requerido.",
    invalid_type_error: "El email debe ser un texto."
  })
  .email("Formato de correo electrónico inválido.")
  .max(100, "El email no puede exceder los 100 caracteres."),
  password: z.string({
    required_error: "El password es requerido.",
    invalid_type_error: "El password debe ser un texto."
  })
  .min(6, "La contraseña debe tener al menos 6 caracteres.")
  .max(100, "La contraseña es demasiado larga."),
  activo: z.boolean({
    invalid_type_error: "El estado activo debe ser un valor booleano."
  }).optional()
});

// 3. Trabajadores
const trabajadorSchema = z.object({
  id_usuario: emptyToNull(z.number({
    invalid_type_error: "El id_usuario debe ser un número."
  }).int().positive("El id_usuario debe ser un número positivo.").optional().nullable()),
  nombre_completo: z.string({
    required_error: "El nombre_completo es requerido.",
    invalid_type_error: "El nombre_completo debe ser un texto."
  })
  .min(1, "El nombre completo no puede estar vacío.")
  .max(150, "El nombre completo no puede exceder los 150 caracteres."),
  cedula: z.string({
    required_error: "La cedula es requerida.",
    invalid_type_error: "La cedula debe ser un texto."
  })
  .min(1, "La cédula no puede estar vacía.")
  .max(50, "La cédula no puede exceder los 50 caracteres."),
  cargo: emptyToNull(z.string({
    invalid_type_error: "El cargo debe ser un texto."
  }).max(100, "El cargo no puede exceder los 100 caracteres.").optional().nullable()),
  fecha_contratacion: emptyToNull(z.string({
    invalid_type_error: "La fecha_contratacion debe ser un texto."
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de contratación debe tener el formato YYYY-MM-DD.")
  .optional()
  .nullable()),
  telefono: emptyToNull(z.string({
    invalid_type_error: "El telefono debe ser un texto."
  }).max(20, "El teléfono no puede exceder los 20 caracteres.").optional().nullable())
});

// 4. Clientes
const clienteSchema = z.object({
  id_usuario: emptyToNull(z.number({
    invalid_type_error: "El id_usuario debe ser un número."
  }).int().positive("El id_usuario debe ser positivo.").optional().nullable()),
  nombre_razon_social: z.string({
    required_error: "El nombre_razon_social es requerido.",
    invalid_type_error: "El nombre_razon_social debe ser un texto."
  })
  .min(1, "El nombre o razón social no puede estar vacío.")
  .max(150, "El nombre o razón social no puede exceder los 150 caracteres."),
  identificacion_fiscal: z.string({
    required_error: "La identificacion_fiscal es requerida.",
    invalid_type_error: "La identificacion_fiscal debe ser un texto."
  })
  .min(1, "La identificación fiscal no puede estar vacía.")
  .max(50, "La identificación fiscal no puede exceder los 50 caracteres."),
  telefono: emptyToNull(z.string({
    invalid_type_error: "El telefono debe ser un texto."
  }).max(20, "El teléfono no puede exceder los 20 caracteres.").optional().nullable()),
  direccion_envio: emptyToNull(z.string({
    invalid_type_error: "La direccion_envio debe ser un texto."
  }).optional().nullable())
});

// 5. Proveedores
const proveedorSchema = z.object({
  nombre_empresa: z.string({
    required_error: "El nombre_empresa es requerido.",
    invalid_type_error: "El nombre_empresa debe ser un texto."
  })
  .min(1, "El nombre de la empresa no puede estar vacío.")
  .max(150, "El nombre de la empresa no puede exceder los 150 caracteres."),
  contacto_principal: emptyToNull(z.string({
    invalid_type_error: "El contacto_principal debe ser un texto."
  }).max(100, "El contacto principal no puede exceder los 100 caracteres.").optional().nullable()),
  telefono: emptyToNull(z.string({
    invalid_type_error: "El telefono debe ser un texto."
  }).max(20, "El teléfono no puede exceder los 20 caracteres.").optional().nullable()),
  email: emptyToNull(z.string({
    invalid_type_error: "El email debe ser un texto."
  })
  .email("Formato de correo electrónico inválido.")
  .max(100, "El email no puede exceder los 100 caracteres.")
  .optional()
  .nullable()),
  direccion: emptyToNull(z.string({
    invalid_type_error: "La direccion debe ser un texto."
  }).optional().nullable())
});

// 6. Insumos
const insumoSchema = z.object({
  id_proveedor: emptyToNull(z.number({
    invalid_type_error: "El id_proveedor debe ser un número."
  }).int().positive().optional().nullable()),
  nombre_insumo: z.string({
    required_error: "El nombre_insumo es requerido.",
    invalid_type_error: "El nombre_insumo debe ser un texto."
  })
  .min(1, "El nombre del insumo no puede estar vacío.")
  .max(150, "El nombre del insumo no puede exceder los 150 caracteres."),
  categoria: emptyToNull(z.string({
    invalid_type_error: "La categoria debe ser un texto."
  }).max(100, "La categoría no puede exceder los 100 caracteres.").optional().nullable()),
  unidad_medida: z.string({
    required_error: "La unidad_medida es requerida.",
    invalid_type_error: "La unidad_medida debe ser un texto."
  })
  .min(1, "La unidad de medida no puede estar vacía.")
  .max(50, "La unidad de medida no puede exceder los 50 caracteres."),
  cantidad_stock: z.number({
    invalid_type_error: "La cantidad_stock debe ser un número."
  }).min(0, "La cantidad de stock no puede ser negativa.").optional()
});

// 7. Compras de Insumos
const compraInsumoSchema = z.object({
  id_proveedor: emptyToNull(z.number({
    invalid_type_error: "El id_proveedor debe ser un número."
  }).int().positive().optional().nullable()),
  monto_total: z.number({
    invalid_type_error: "El monto_total debe ser un número."
  }).min(0, "El monto total no puede ser negativo.").optional()
});

// 8. Detalles de Compras
const detalleCompraSchema = z.object({
  id_compra: z.number({
    required_error: "El id_compra es requerido.",
    invalid_type_error: "El id_compra debe ser un número."
  }).int().positive(),
  id_insumo: z.number({
    required_error: "El id_insumo es requerido.",
    invalid_type_error: "El id_insumo debe ser un número."
  }).int().positive(),
  cantidad: z.number({
    required_error: "La cantidad es requerida.",
    invalid_type_error: "La cantidad debe ser un número."
  }).positive("La cantidad debe ser mayor a 0."),
  precio_unitario: z.number({
    required_error: "El precio_unitario es requerido.",
    invalid_type_error: "El precio_unitario debe ser un número."
  }).positive("El precio unitario debe ser mayor a 0.")
});

// 9. Lotes
const loteSchema = z.object({
  codigo_lote: z.string({
    required_error: "El codigo_lote es requerido.",
    invalid_type_error: "El codigo_lote debe ser un texto."
  })
  .min(1, "El código de lote no puede estar vacío.")
  .max(50, "El código de lote no puede exceder los 50 caracteres."),
  descripcion: emptyToNull(z.string({
    invalid_type_error: "La descripcion debe ser un texto."
  }).optional().nullable()),
  capacidad_maxima: z.number({
    required_error: "La capacidad_maxima es requerida.",
    invalid_type_error: "La capacidad_maxima debe ser un número."
  }).positive("La capacidad máxima debe ser mayor a 0."),
  capacidad_actual: z.number({
    invalid_type_error: "La capacidad_actual debe ser un número."
  }).min(0, "La capacidad actual no puede ser negativa.").optional(),
  estado: z.string({
    invalid_type_error: "El estado debe ser un texto."
  }).max(50, "El estado no puede exceder los 50 caracteres.").optional()
});

// 10. Productos Finales
const productoFinalSchema = z.object({
  nombre_producto: z.string({
    required_error: "El nombre_producto es requerido.",
    invalid_type_error: "El nombre_producto debe ser un texto."
  })
  .min(1, "El nombre del producto no puede estar vacío.")
  .max(150, "El nombre del producto no puede exceder los 150 caracteres."),
  presentacion: emptyToNull(z.string({
    invalid_type_error: "La presentacion debe ser un texto."
  }).max(100, "La presentación no puede exceder los 100 caracteres.").optional().nullable()),
  peso_gramos: z.number({
    required_error: "El peso_gramos es requerido.",
    invalid_type_error: "El peso_gramos debe ser un número."
  }).int().positive("El peso en gramos debe ser un número entero positivo."),
  precio_venta: z.number({
    required_error: "El precio_venta es requerido.",
    invalid_type_error: "El precio_venta debe ser un número."
  }).positive("El precio de venta debe ser mayor a 0."),
  stock_disponible: z.number({
    invalid_type_error: "El stock_disponible debe ser un número."
  }).int().nonnegative("El stock disponible no puede ser negativo.").optional()
});

// 11. Producción
const produccionSchema = z.object({
  id_lote: z.number({
    required_error: "El id_lote es requerido.",
    invalid_type_error: "El id_lote debe ser un número."
  }).int().positive(),
  id_trabajador: emptyToNull(z.number({
    invalid_type_error: "El id_trabajador debe ser un número."
  }).int().positive().optional().nullable()),
  cantidad_producida_kg: z.number({
    required_error: "La cantidad_producida_kg es requerida.",
    invalid_type_error: "La cantidad_producida_kg debe ser un número."
  }).positive("La cantidad producida debe ser mayor a 0."),
  observaciones: emptyToNull(z.string({
    invalid_type_error: "Las observaciones deben ser un texto."
  }).optional().nullable()),
  fecha_produccion: emptyToNull(z.string({
    invalid_type_error: "La fecha_produccion debe ser un texto."
  })
  .regex(/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/, "La fecha de producción debe tener el formato YYYY-MM-DD o YYYY-MM-DD HH:mm:ss.")
  .optional()
  .nullable())
});

// 12. Empaquetado
const empaquetadoSchema = z.object({
  id_produccion: z.number({
    required_error: "El id_produccion es requerido.",
    invalid_type_error: "El id_produccion debe ser un número."
  }).int().positive(),
  id_producto: z.number({
    required_error: "El id_producto es requerido.",
    invalid_type_error: "El id_producto debe ser un número."
  }).int().positive(),
  cantidad_unidades: z.number({
    required_error: "La cantidad_unidades es requerida.",
    invalid_type_error: "La cantidad_unidades debe ser un número."
  }).int().positive("La cantidad de unidades debe ser un número entero positivo.")
});

// 13. Pedidos
const pedidoSchema = z.object({
  id_cliente: emptyToNull(z.number({
    invalid_type_error: "El id_cliente debe ser un número."
  }).int().positive().optional().nullable()),
  estado_pedido: z.string({
    invalid_type_error: "El estado_pedido debe ser un texto."
  }).max(50, "El estado del pedido no puede exceder los 50 caracteres.").optional(),
  monto_total: z.number({
    invalid_type_error: "El monto_total debe ser un número."
  }).min(0, "El monto total no puede ser negativo.").optional()
});

// 14. Detalles de Pedidos
const detallePedidoSchema = z.object({
  id_pedido: z.number({
    required_error: "El id_pedido es requerido.",
    invalid_type_error: "El id_pedido debe ser un número."
  }).int().positive(),
  id_producto: z.number({
    required_error: "El id_producto es requerido.",
    invalid_type_error: "El id_producto debe ser un número."
  }).int().positive(),
  cantidad: z.number({
    required_error: "La cantidad es requerida.",
    invalid_type_error: "La cantidad debe ser un número."
  }).int().positive("La cantidad debe ser un número entero positivo."),
  precio_unitario: z.number({
    required_error: "El precio_unitario es requerido.",
    invalid_type_error: "El precio_unitario debe ser un número."
  }).positive("El precio unitario debe ser mayor a 0.")
});

// 15. Auth Login
const loginSchema = z.object({
  email: z.string({
    required_error: "El email es requerido.",
    invalid_type_error: "El email debe ser un texto."
  }).email("Formato de correo electrónico inválido."),
  password: z.string({
    required_error: "El password es requerido.",
    invalid_type_error: "El password debe ser un texto."
  }).min(1, "La contraseña no puede estar vacía.")
});

// Export create and partial update schemas
module.exports = {
  createRolSchema: rolSchema,
  updateRolSchema: rolSchema.partial(),
  
  createUsuarioSchema: usuarioSchema,
  updateUsuarioSchema: usuarioSchema.partial(),
  
  createTrabajadorSchema: trabajadorSchema,
  updateTrabajadorSchema: trabajadorSchema.partial(),
  
  createClienteSchema: clienteSchema,
  updateClienteSchema: clienteSchema.partial(),
  
  createProveedorSchema: proveedorSchema,
  updateProveedorSchema: proveedorSchema.partial(),
  
  createInsumoSchema: insumoSchema,
  updateInsumoSchema: insumoSchema.partial(),
  
  createCompraInsumoSchema: compraInsumoSchema,
  updateCompraInsumoSchema: compraInsumoSchema.partial(),
  
  createDetalleCompraSchema: detalleCompraSchema,
  updateDetalleCompraSchema: detalleCompraSchema.partial(),
  
  createLoteSchema: loteSchema,
  updateLoteSchema: loteSchema.partial(),
  
  createProductoFinalSchema: productoFinalSchema,
  updateProductoFinalSchema: productoFinalSchema.partial(),
  
  createProduccionSchema: produccionSchema,
  updateProduccionSchema: produccionSchema.partial(),
  
  createEmpaquetadoSchema: empaquetadoSchema,
  updateEmpaquetadoSchema: empaquetadoSchema.partial(),
  
  createPedidoSchema: pedidoSchema,
  updatePedidoSchema: pedidoSchema.partial(),
  
  createDetallePedidoSchema: detallePedidoSchema,
  updateDetallePedidoSchema: detallePedidoSchema.partial(),
  
  registerSchema: usuarioSchema,
  loginSchema
};
