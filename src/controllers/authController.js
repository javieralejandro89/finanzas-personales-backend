const jwt = require('jsonwebtoken');
const { User, Category } = require('../models');

// Función para generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Función para crear categorías por defecto
const createDefaultCategories = async (userId) => {
  const defaultCategories = [
    // Categorías de ingresos
    { name: 'Salario', type: 'income', color: '#10B981', user_id: userId },
    { name: 'Freelance', type: 'income', color: '#3B82F6', user_id: userId },
    { name: 'Inversiones', type: 'income', color: '#8B5CF6', user_id: userId },
    { name: 'Otros ingresos', type: 'income', color: '#F59E0B', user_id: userId },
    
    // Categorías de gastos
    { name: 'Alimentación', type: 'expense', color: '#EF4444', user_id: userId },
    { name: 'Transporte', type: 'expense', color: '#F97316', user_id: userId },
    { name: 'Vivienda', type: 'expense', color: '#84CC16', user_id: userId },
    { name: 'Salud', type: 'expense', color: '#06B6D4', user_id: userId },
    { name: 'Entretenimiento', type: 'expense', color: '#8B5CF6', user_id: userId },
    { name: 'Educación', type: 'expense', color: '#EC4899', user_id: userId },
    { name: 'Servicios', type: 'expense', color: '#6B7280', user_id: userId },
    { name: 'Otros gastos', type: 'expense', color: '#374151', user_id: userId }
  ];

  try {
    await Category.bulkCreate(defaultCategories);
  } catch (error) {
    console.error('Error creando categorías por defecto:', error);
  }
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const { name, email, password, currency = 'USD' } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      currency
    });

    // Crear categorías por defecto
    await createDefaultCategories(user.id);

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          created_at: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, currency } = req.body;

    const [updatedRows] = await User.update(
      { name, currency },
      { where: { id: userId } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const updatedUser = await User.findByPk(userId);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          currency: updatedUser.currency
        }
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await User.scope('withPassword').findByPk(userId);
    
    // Verificar contraseña actual
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};