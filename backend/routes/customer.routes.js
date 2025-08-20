const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth.middleware');

// Validaciones para crear cliente
const createCustomerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres')
    .trim(),
  
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres')
    .trim(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede exceder 20 caracteres')
    .trim(),
  
  body('street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La dirección no puede exceder 100 caracteres')
    .trim(),
  
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La ciudad no puede exceder 50 caracteres')
    .trim(),
  
  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El estado no puede exceder 50 caracteres')
    .trim(),
  
  body('zipCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('El código postal no puede exceder 10 caracteres')
    .trim(),
  
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El país no puede exceder 50 caracteres')
    .trim(),
  
  body('customerType')
    .optional()
    .isIn(['individual', 'empresa'])
    .withMessage('Tipo de cliente inválido'),
  
  body('rfc')
    .optional()
    .isLength({ min: 8, max: 15 })
    .withMessage('El RFC/RUC debe tener entre 8 y 15 caracteres')
    .matches(/^([A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}|[0-9]{11}|[A-Z0-9]{8,13})$/)
    .withMessage('Formato de RFC/RUC inválido (RFC mexicano, RUC peruano de 11 dígitos, o ID fiscal de 8-13 caracteres)')
    .trim(),
  
  body('companyName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El nombre de la empresa no puede exceder 100 caracteres')
    .trim(),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar cliente
const updateCustomerValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El apellido debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('El teléfono debe tener entre 1 y 20 caracteres')
    .trim(),
  
  body('street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La dirección no puede exceder 100 caracteres')
    .trim(),
  
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La ciudad no puede exceder 50 caracteres')
    .trim(),
  
  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El estado no puede exceder 50 caracteres')
    .trim(),
  
  body('zipCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('El código postal no puede exceder 10 caracteres')
    .trim(),
  
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El país no puede exceder 50 caracteres')
    .trim(),
  
  body('customerType')
    .optional()
    .isIn(['individual', 'empresa'])
    .withMessage('Tipo de cliente inválido'),
  
  body('rfc')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true; // Permitir null/empty
      if (!/^([A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}|[0-9]{11}|[A-Z0-9]{8,13})$/.test(value)) {
        throw new Error('Formato de RFC/RUC inválido (RFC mexicano, RUC peruano de 11 dígitos, o ID fiscal de 8-13 caracteres)');
      }
      return true;
    })
    .trim(),
  
  body('companyName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El nombre de la empresa no puede exceder 100 caracteres')
    .trim(),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de consulta (disponibles para todos los usuarios autenticados)
router.get('/', customerController.getCustomers);
router.get('/active', customerController.getActiveCustomers);
router.get('/:id', customerController.getCustomerById);
router.get('/:id/stats', customerController.getCustomerStats);

// Rutas de modificación (todos los usuarios autenticados pueden gestionar clientes)
router.post('/', createCustomerValidation, customerController.createCustomer);
router.put('/:id', updateCustomerValidation, customerController.updateCustomer);
router.delete('/:id', requireAdminOrManager, customerController.deleteCustomer);

module.exports = router;
