const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    return res.status(400).json({
      success: false,
      message: `Error de validación de datos: ${errorDetails}`,
      errors: result.error.issues.map(err => ({
        campo: err.path.join('.'),
        mensaje: err.message
      }))
    });
  }
  // Reemplazar req.body con los datos validados y transformados
  req.body = result.data;
  next();
};

module.exports = {
  validateBody
};
