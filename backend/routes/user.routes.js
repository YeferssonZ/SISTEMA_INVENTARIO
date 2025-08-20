const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Validaciones para crear usuario
const createUserValidation = [
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
    .withMessage('Rol inválido'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres'),
  
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres'),
  
  body('role')
    .optional()
    .isIn(['admin', 'employee', 'manager'])
    .withMessage('Rol inválido'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para cambiar contraseña de usuario
const changeUserPasswordValidation = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Rutas CRUD
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', createUserValidation, userController.createUser);
router.put('/:id', updateUserValidation, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/change-password', changeUserPasswordValidation, userController.changeUserPassword);

module.exports = router;
