const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const { sendWelcomeEmail } = require('../services/emailService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforcoffeeproducer123';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  const { id_rol, email, password, activo } = req.body;

  if (!email || !password || !id_rol) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, contraseña y rol (id_rol) son requeridos.' 
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico ya está registrado.' 
      });
    }

    // Verificar si el rol existe
    const rol = await Rol.findById(id_rol);
    if (!rol) {
      return res.status(400).json({ 
        success: false, 
        message: 'El rol especificado no existe.' 
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Crear el usuario
    const newUser = await Usuario.create({
      id_rol,
      email,
      password_hash,
      activo: activo !== undefined ? activo : true
    });

    // Enviar correo de bienvenida de forma asíncrona
    sendWelcomeEmail(email);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: newUser
    });
  } catch (error) {
    console.error('Error en el registro de usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor al registrar el usuario.',
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email y contraseña son requeridos.' 
    });
  }

  try {
    // Buscar usuario por correo electrónico
    const user = await Usuario.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas (correo o contraseña incorrectos).' 
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({ 
        success: false, 
        message: 'Esta cuenta ha sido desactivada. Por favor contacta al administrador.' 
      });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas (correo o contraseña incorrectos).' 
      });
    }

    // Generar Token JWT
    const payload = {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      nombre_rol: user.nombre_rol,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      message: 'Autenticación exitosa.',
      token: `Bearer ${token}`,
      user: {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol,
        nombre_rol: user.nombre_rol,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en el login de usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor al iniciar sesión.',
      error: error.message 
    });
  }
};
