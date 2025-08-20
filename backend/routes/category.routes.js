const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth.middleware');

// Validaciones para crear categoría
const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar categoría
const updateCategoryValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de consulta (disponibles para todos los usuarios autenticados)
router.get('/', categoryController.getCategories);
router.get('/active', categoryController.getActiveCategories);
router.get('/stats', categoryController.getCategoryStats);
router.get('/:id', categoryController.getCategoryById);

// Rutas de modificación (solo admin y manager)
router.post('/', requireAdminOrManager, createCategoryValidation, categoryController.createCategory);
router.put('/:id', requireAdminOrManager, updateCategoryValidation, categoryController.updateCategory);
router.delete('/:id', requireAdminOrManager, categoryController.deleteCategory);

module.exports = router;
