const { Sale, SaleDetail, Product, Customer, Category, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db.config');

// Reporte de ventas por período
const getSalesReport = async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      customerId, 
      categoryId, 
      userId,
      groupBy = 'day' // day, week, month, year
    } = req.query;

    // Construir filtros
    const where = { status: { [Op.ne]: 'cancelada' } };
    
    if (dateFrom || dateTo) {
      where.saleDate = {};
      if (dateFrom) {
        where.saleDate[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.saleDate[Op.lte] = endDate;
      }
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (userId) {
      where.createdBy = userId;
    }

    // Incluir filtro de categoría si se especifica
    const include = [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'username']
      }
    ];

    if (categoryId) {
      include.push({
        model: SaleDetail,
        as: 'details',
        include: [
          {
            model: Product,
            as: 'product',
            where: { categoryId },
            attributes: []
          }
        ],
        attributes: []
      });
    }

    // Definir formato de fecha según agrupación
    let dateFormat;
    switch (groupBy) {
      case 'year':
        dateFormat = '%Y';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // Año-semana
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d';
        break;
    }

    // Obtener ventas agrupadas
    const salesReport = await Sale.findAll({
      where,
      include,
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('saleDate'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'salesCount'],
        [sequelize.fn('SUM', sequelize.col('Sale.total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('Sale.total')), 'averageSale'],
        [sequelize.fn('SUM', sequelize.col('Sale.tax')), 'totalTax'],
        [sequelize.fn('SUM', sequelize.col('Sale.discount')), 'totalDiscount']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('saleDate'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('saleDate'), dateFormat), 'ASC']],
      raw: true
    });

    // Obtener totales generales
    const totals = await Sale.findAll({
      where,
      include: categoryId ? include : [],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('Sale.total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('Sale.total')), 'averageSale'],
        [sequelize.fn('SUM', sequelize.col('Sale.tax')), 'totalTax'],
        [sequelize.fn('SUM', sequelize.col('Sale.discount')), 'totalDiscount']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        salesReport,
        totals: totals[0] || {
          totalSales: 0,
          totalRevenue: 0,
          averageSale: 0,
          totalTax: 0,
          totalDiscount: 0
        },
        filters: {
          dateFrom,
          dateTo,
          customerId,
          categoryId,
          userId,
          groupBy
        }
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Reporte de inventario
const getInventoryReport = async (req, res) => {
  try {
    const { 
      categoryId, 
      lowStock, 
      zeroStock,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    // Construir filtros
    const where = { isActive: true };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (lowStock === 'true') {
      where[Op.and] = [
        sequelize.where(
          sequelize.col('stock'), 
          '<=', 
          sequelize.col('minStock')
        )
      ];
    }

    if (zeroStock === 'true') {
      where.stock = 0;
    }

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    // Calcular estadísticas
    const stats = await Product.findAll({
      where: { isActive: true, categoryId: categoryId || { [Op.ne]: null } },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalProducts'],
        [sequelize.fn('SUM', sequelize.col('stock')), 'totalStock'],
        [sequelize.fn('SUM', sequelize.fn('MULTIPLY', sequelize.col('stock'), sequelize.col('cost'))), 'totalInventoryValue'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN stock <= minStock THEN 1 END')), 'lowStockProducts'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN stock = 0 THEN 1 END')), 'zeroStockProducts']
      ],
      raw: true
    });

    // Agregar información calculada a productos
    const productsWithInfo = products.map(product => {
      const productData = product.toJSON();
      productData.stockValue = parseFloat(product.stock) * parseFloat(product.cost);
      productData.profitMargin = product.getProfitMargin();
      productData.stockStatus = product.getStockStatus();
      return productData;
    });

    res.json({
      success: true,
      data: {
        products: productsWithInfo,
        stats: stats[0] || {
          totalProducts: 0,
          totalStock: 0,
          totalInventoryValue: 0,
          lowStockProducts: 0,
          zeroStockProducts: 0
        },
        filters: {
          categoryId,
          lowStock,
          zeroStock,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Reporte de productos más vendidos
const getTopProductsReport = async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      categoryId,
      limit = 20
    } = req.query;

    // Construir filtros para ventas
    const saleWhere = { status: { [Op.ne]: 'cancelada' } };
    
    if (dateFrom || dateTo) {
      saleWhere.saleDate = {};
      if (dateFrom) {
        saleWhere.saleDate[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        saleWhere.saleDate[Op.lte] = endDate;
      }
    }

    // Construir filtros para productos
    const productWhere = {};
    if (categoryId) {
      productWhere.categoryId = categoryId;
    }

    const topProducts = await SaleDetail.findAll({
      include: [
        {
          model: Sale,
          as: 'sale',
          where: saleWhere,
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          where: productWhere,
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('COUNT', sequelize.col('SaleDetail.id')), 'salesCount'],
        [sequelize.fn('SUM', sequelize.col('SaleDetail.total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('unitPrice')), 'averagePrice']
      ],
      group: [
        'productId', 
        'product.id', 
        'product.name', 
        'product.sku', 
        'product.price', 
        'product.cost',
        'product.stock',
        'product.category.id',
        'product.category.name'
      ],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        topProducts,
        filters: {
          dateFrom,
          dateTo,
          categoryId,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de productos más vendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Reporte de clientes
const getCustomersReport = async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      customerType,
      minPurchases,
      sortBy = 'totalPurchases',
      sortOrder = 'DESC'
    } = req.query;

    // Construir filtros
    const where = { isActive: true };
    
    if (customerType) {
      where.customerType = customerType;
    }

    if (minPurchases) {
      where.totalPurchases = { [Op.gte]: parseFloat(minPurchases) };
    }

    // Construir filtros de fecha para ventas
    const saleWhere = {};
    if (dateFrom || dateTo) {
      saleWhere.saleDate = {};
      if (dateFrom) {
        saleWhere.saleDate[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        saleWhere.saleDate[Op.lte] = endDate;
      }
    }

    const customers = await Customer.findAll({
      where,
      include: [
        {
          model: Sale,
          as: 'sales',
          where: Object.keys(saleWhere).length > 0 ? saleWhere : undefined,
          required: false,
          attributes: []
        }
      ],
      attributes: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'customerType',
        'totalPurchases',
        'lastPurchaseDate',
        [sequelize.fn('COUNT', sequelize.col('sales.id')), 'salesInPeriod'],
        [sequelize.fn('SUM', sequelize.col('sales.total')), 'revenueInPeriod']
      ],
      group: [
        'Customer.id',
        'Customer.firstName',
        'Customer.lastName',
        'Customer.email',
        'Customer.phone',
        'Customer.customerType',
        'Customer.totalPurchases',
        'Customer.lastPurchaseDate'
      ],
      order: [[sortBy === 'revenueInPeriod' ? sequelize.fn('SUM', sequelize.col('sales.total')) : sortBy, sortOrder.toUpperCase()]]
    });

    // Estadísticas generales
    const stats = await Customer.findAll({
      where: { isActive: true },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCustomers'],
        [sequelize.fn('SUM', sequelize.col('totalPurchases')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('totalPurchases')), 'averageCustomerValue']
      ],
      raw: true
    });

    // Agregar nombre completo a cada cliente
    const customersWithInfo = customers.map(customer => {
      const customerData = customer.toJSON();
      customerData.fullName = `${customer.firstName} ${customer.lastName}`;
      return customerData;
    });

    res.json({
      success: true,
      data: {
        customers: customersWithInfo,
        stats: stats[0] || {
          totalCustomers: 0,
          totalRevenue: 0,
          averageCustomerValue: 0
        },
        filters: {
          dateFrom,
          dateTo,
          customerType,
          minPurchases,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error al generar reporte de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Dashboard con estadísticas generales
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Ventas de hoy
    const todaySales = await Sale.findAll({
      where: {
        saleDate: { [Op.gte]: startOfDay },
        status: { [Op.ne]: 'cancelada' }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      raw: true
    });

    // Ventas del mes
    const monthSales = await Sale.findAll({
      where: {
        saleDate: { [Op.gte]: startOfMonth },
        status: { [Op.ne]: 'cancelada' }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      raw: true
    });

    // Productos con stock bajo
    const lowStockProducts = await Product.count({
      where: {
        isActive: true,
        [Op.and]: [
          sequelize.where(
            sequelize.col('stock'), 
            '<=', 
            sequelize.col('minStock')
          )
        ]
      }
    });

    // Total de productos activos
    const totalProducts = await Product.count({
      where: { isActive: true }
    });

    // Total de clientes activos
    const totalCustomers = await Customer.count({
      where: { isActive: true }
    });

    // Ventas por mes (últimos 6 meses)
    const salesByMonth = await Sale.findAll({
      where: {
        saleDate: {
          [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 6 MONTH)")
        },
        status: { [Op.ne]: 'cancelada' }
      },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('saleDate'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'salesCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('saleDate'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('saleDate'), '%Y-%m'), 'ASC']],
      raw: true
    });

    // Top 5 productos más vendidos (este mes)
    const topProducts = await SaleDetail.findAll({
      include: [
        {
          model: Sale,
          as: 'sale',
          where: {
            saleDate: { [Op.gte]: startOfMonth },
            status: { [Op.ne]: 'cancelada' }
          },
          attributes: []
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ],
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('SaleDetail.total')), 'totalRevenue']
      ],
      group: ['productId', 'product.id', 'product.name', 'product.sku'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      success: true,
      data: {
        todaySales: todaySales[0] || { count: 0, total: 0 },
        monthSales: monthSales[0] || { count: 0, total: 0 },
        lowStockProducts,
        totalProducts,
        totalCustomers,
        salesByMonth,
        topProducts
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getTopProductsReport,
  getCustomersReport,
  getDashboardStats
};
