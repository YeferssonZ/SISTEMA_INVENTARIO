const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para autenticar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Buscar usuario
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('AUTHORIZE - Usuario:', req.user ? req.user.role : 'No user');
    console.log('AUTHORIZE - Roles permitidos:', roles);
    
    if (!req.user) {
      console.log('AUTHORIZE - Usuario no autenticado');
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('AUTHORIZE - Sin permisos. Usuario:', req.user.role, 'Requerido:', roles);
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    console.log('AUTHORIZE - Permisos OK');
    next();
  };
};

// Middleware para verificar si es admin
const requireAdmin = authorize('admin');

// Middleware para verificar si es admin o manager
const requireAdminOrManager = authorize('admin', 'manager');

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  requireAdminOrManager
};
