const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth.middleware');

// Validaciones para reportes con fechas
const dateRangeValidation = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida (formato: YYYY-MM-DD)'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida (formato: YYYY-MM-DD)')
];

// Validaciones para reporte de ventas
const salesReportValidation = [
  ...dateRangeValidation,
  query('customerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de cliente inválido'),
  
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Agrupación inválida (day, week, month, year)')
];

// Validaciones para reporte de inventario
const inventoryReportValidation = [
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('lowStock debe ser un valor booleano'),
  
  query('zeroStock')
    .optional()
    .isBoolean()
    .withMessage('zeroStock debe ser un valor booleano'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'sku', 'stock', 'price', 'cost'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Orden inválido (ASC, DESC)')
];

// Validaciones para reporte de productos más vendidos
const topProductsReportValidation = [
  ...dateRangeValidation,
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite inválido (1-100)')
];

// Validaciones para reporte de clientes
const customersReportValidation = [
  ...dateRangeValidation,
  query('customerType')
    .optional()
    .isIn(['individual', 'empresa'])
    .withMessage('Tipo de cliente inválido'),
  
  query('minPurchases')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monto mínimo de compras inválido'),
  
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'totalPurchases', 'revenueInPeriod'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Orden inválido (ASC, DESC)')
];

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Dashboard (disponible para todos los usuarios autenticados)
router.get('/dashboard', reportController.getDashboardStats);

// Reportes (solo admin y manager)
router.get('/sales', requireAdminOrManager, salesReportValidation, reportController.getSalesReport);
router.get('/inventory', requireAdminOrManager, inventoryReportValidation, reportController.getInventoryReport);
router.get('/top-products', requireAdminOrManager, topProductsReportValidation, reportController.getTopProductsReport);
router.get('/customers', requireAdminOrManager, customersReportValidation, reportController.getCustomersReport);

module.exports = router;
