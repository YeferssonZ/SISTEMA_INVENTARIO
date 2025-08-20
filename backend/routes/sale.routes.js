const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth.middleware');

// Validaciones para crear venta
const createSaleValidation = [
  body('customerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de cliente inválido'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
  
  body('items.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio unitario debe ser un número mayor or igual a 0'),
  
  body('items.*.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El descuento debe ser un número mayor o igual a 0'),
  
  body('subtotal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El subtotal debe ser un número mayor o igual a 0'),
  
  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El impuesto debe ser un número mayor o igual a 0'),
  
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El total debe ser un número mayor o igual a 0'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El descuento debe ser un número mayor o igual a 0'),
  
  body('paymentMethod')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia', 'credito'])
    .withMessage('Método de pago inválido'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim()
];

// Validaciones para actualizar venta
const updateSaleValidation = [
  body('status')
    .optional()
    .isIn(['pendiente', 'completada', 'cancelada'])
    .withMessage('Estado de venta inválido'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
    .trim()
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de consulta (disponibles para todos los usuarios autenticados)
router.get('/', saleController.getSales);
router.get('/stats', saleController.getSalesStats);
router.get('/:id', saleController.getSaleById);

// Rutas de modificación (todos los usuarios autenticados pueden crear ventas)
router.post('/', createSaleValidation, saleController.createSale);

// Solo admin y manager pueden actualizar/cancelar ventas
router.put('/:id', requireAdminOrManager, updateSaleValidation, saleController.updateSale);
router.delete('/:id', requireAdminOrManager, saleController.deleteSale);

// Endpoint temporal de debug
router.delete('/debug/:id', (req, res) => {
  console.log('DEBUG - Usuario:', req.user ? req.user.role : 'No user');
  console.log('DEBUG - ID:', req.params.id);
  res.json({ success: true, message: 'Debug OK', user: req.user ? req.user.role : 'No user' });
});

module.exports = router;
