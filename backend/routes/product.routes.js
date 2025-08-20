const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth.middleware');

// Validaciones para crear producto
const createProductValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre del producto es requerido')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  
  body('sku')
    .notEmpty()
    .withMessage('El SKU es requerido')
    .isLength({ max: 50 })
    .withMessage('El SKU no puede exceder 50 caracteres')
    .trim(),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo debe ser un número mayor o igual a 0'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
  
  body('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock máximo debe ser un número entero mayor o igual a 0'),
  
  body('unit')
    .optional()
    .isIn(['pza', 'kg', 'lt', 'mt', 'caja', 'paquete'])
    .withMessage('Unidad de medida inválida'),
  
  body('barcode')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El código de barras no puede exceder 50 caracteres')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar producto
const updateProductValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  
  body('sku')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El SKU debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El costo debe ser un número mayor o igual a 0'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
  
  body('maxStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock máximo debe ser un número entero mayor o igual a 0'),
  
  body('unit')
    .optional()
    .isIn(['pza', 'kg', 'lt', 'mt', 'caja', 'paquete'])
    .withMessage('Unidad de medida inválida'),
  
  body('barcode')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El código de barras no puede exceder 50 caracteres')
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para actualizar stock
const updateStockValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 0'),
  
  body('type')
    .isIn(['add', 'subtract', 'set'])
    .withMessage('Tipo de operación inválido (add, subtract, set)'),
  
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La razón no puede exceder 200 caracteres')
    .trim()
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de consulta (disponibles para todos los usuarios autenticados)
router.get('/', productController.getProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', productController.getProductById);

// Rutas de modificación (solo admin y manager)
router.post('/', requireAdminOrManager, createProductValidation, productController.createProduct);
router.put('/:id', requireAdminOrManager, updateProductValidation, productController.updateProduct);
router.put('/:id/stock', requireAdminOrManager, updateStockValidation, productController.updateStock);
router.delete('/:id', requireAdminOrManager, productController.deleteProduct);

module.exports = router;
