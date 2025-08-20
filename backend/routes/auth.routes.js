const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Validaciones para registro
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),
  
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),
  
  body('role')
    .optional()
    .isIn(['admin', 'employee', 'manager'])
    .withMessage('Rol inválido')
];

// Validaciones para login
const loginValidation = [
  body('login')
    .notEmpty()
    .withMessage('Email o nombre de usuario requerido'),
  
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida')
];

// Validaciones para actualizar perfil
const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),
  
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

// Validaciones para cambiar contraseña
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Contraseña actual requerida'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// Rutas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Rutas protegidas
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, authController.updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);

module.exports = router;
