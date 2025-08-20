const { validationResult } = require('express-validator');
const { Sale, SaleDetail, Product, Customer, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db.config');

// Generar número de venta único
const generateSaleNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `V${year}${month}${day}`;
  
  // Buscar el último número de venta del día
  const lastSale = await Sale.findOne({
    where: {
      saleNumber: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['saleNumber', 'DESC']]
  });

  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Obtener todas las ventas
const getSales = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      customerId, 
      status,
      dateFrom,
      dateTo,
      sortBy = 'saleDate',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    // Manejo específico del filtro de estado
    if (status) {
      // Si se especifica un estado, mostrarlo (incluyendo 'cancelada')
      where.status = status;
    } else {
      // Por defecto, no mostrar ventas canceladas
      where.status = { [Op.ne]: 'cancelada' };
    }
    
    if (search) {
      where[Op.or] = [
        { saleNumber: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

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

    const { count, rows: sales } = await Sale.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: SaleDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'unit']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener venta por ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: SaleDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: sale
    });

  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nueva venta
const createSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      customerId, items, subtotal: providedSubtotal, tax, discount, total: providedTotal, paymentMethod, notes
    } = req.body;

    // Verificar que el cliente existe (solo si se proporciona customerId)
    let customer = null;
    if (customerId) {
      customer = await Customer.findByPk(customerId);
      if (!customer) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
    }

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto en la venta'
      });
    }

    // Verificar stock y calcular totales
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Producto con ID ${item.productId} no encontrado`
        });
      }

      if (!product.isActive) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `El producto ${product.name} no está activo`
        });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}`
        });
      }

      const unitPrice = item.unitPrice || item.price || product.price;
      const itemDiscount = item.discount || 0;
      const itemSubtotal = (unitPrice * item.quantity) - itemDiscount;

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity,
        discount: itemDiscount,
        total: itemSubtotal,
        product
      });

      subtotal += itemSubtotal;
    }

    // Calcular o usar totales proporcionados
    const saleDiscount = discount || 0;
    const saleTax = tax || 0;
    const finalSubtotal = providedSubtotal || subtotal;
    const finalTotal = providedTotal || (subtotal - saleDiscount + saleTax);

    // Generar número de venta
    const saleNumber = await generateSaleNumber();

    // Crear venta
    const sale = await Sale.create({
      saleNumber,
      customerId,
      saleDate: new Date(),
      subtotal: finalSubtotal,
      tax: saleTax,
      discount: saleDiscount,
      total: finalTotal,
      paymentMethod: paymentMethod || 'efectivo',
      status: 'completada',
      notes,
      createdBy: req.user.id
    }, { transaction });

    // Crear detalles de venta y actualizar stock
    for (const item of processedItems) {
      // Crear detalle de venta
      await SaleDetail.create({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        discount: item.discount,
        total: item.total
      }, { transaction });

      // Actualizar stock del producto
      await item.product.update({
        stock: item.product.stock - item.quantity
      }, { transaction });
    }

    // Actualizar estadísticas del cliente (solo si hay cliente)
    if (customer) {
      await customer.update({
        totalPurchases: parseFloat(customer.totalPurchases) + parseFloat(finalTotal),
        lastPurchaseDate: new Date()
      }, { transaction });
    }

    await transaction.commit();

    // Obtener venta completa con relaciones
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: SaleDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: completeSale
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar venta (solo si está pendiente)
const updateSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const sale = await Sale.findByPk(id, { transaction });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    if (sale.status === 'cancelada') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar una venta cancelada'
      });
    }

    // Si se está cancelando la venta, restaurar el stock
    if (status === 'cancelada' && sale.status !== 'cancelada') {
      const saleDetails = await SaleDetail.findAll({
        where: { saleId: id },
        include: [{ model: Product, as: 'product' }],
        transaction
      });

      for (const detail of saleDetails) {
        await detail.product.update({
          stock: detail.product.stock + detail.quantity
        }, { transaction });
      }

      // Actualizar estadísticas del cliente
      const customer = await Customer.findByPk(sale.customerId, { transaction });
      if (customer) {
        await customer.update({
          totalPurchases: Math.max(0, parseFloat(customer.totalPurchases) - parseFloat(sale.total))
        }, { transaction });
      }
    }

    // Actualizar venta
    await sale.update({
      status: status || sale.status,
      notes: notes !== undefined ? notes : sale.notes
    }, { transaction });

    await transaction.commit();

    // Obtener venta actualizada
    const updatedSale = await Sale.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: SaleDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Venta actualizada exitosamente',
      data: updatedSale
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de ventas
const getSalesStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'day':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = {
          saleDate: {
            [Op.gte]: startOfDay,
            [Op.lt]: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = {
          saleDate: {
            [Op.gte]: startOfWeek
          }
        };
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = {
          saleDate: {
            [Op.gte]: startOfMonth
          }
        };
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = {
          saleDate: {
            [Op.gte]: startOfYear
          }
        };
        break;
    }

    // Estadísticas generales
    const generalStats = await Sale.findAll({
      where: {
        ...dateFilter,
        status: { [Op.ne]: 'cancelada' }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageSale'],
        [sequelize.fn('SUM', sequelize.col('tax')), 'totalTax'],
        [sequelize.fn('SUM', sequelize.col('discount')), 'totalDiscount']
      ],
      raw: true
    });

    // Ventas por método de pago
    const paymentMethodStats = await Sale.findAll({
      where: {
        ...dateFilter,
        status: { [Op.ne]: 'cancelada' }
      },
      attributes: [
        'paymentMethod',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total']
      ],
      group: ['paymentMethod'],
      raw: true
    });

    // Top productos vendidos
    const topProducts = await SaleDetail.findAll({
      include: [
        {
          model: Sale,
          as: 'sale',
          where: {
            ...dateFilter,
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
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
      ],
      group: ['productId', 'product.id', 'product.name', 'product.sku'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      success: true,
      data: {
        period,
        generalStats: generalStats[0] || {
          totalSales: 0,
          totalRevenue: 0,
          averageSale: 0,
          totalTax: 0,
          totalDiscount: 0
        },
        paymentMethodStats,
        topProducts
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar venta (cancelar)
const deleteSale = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: SaleDetail,
          as: 'details',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: Customer,
          as: 'customer'
        }
      ],
      transaction
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Si la venta ya está cancelada, devolver éxito sin hacer cambios
    if (sale.status === 'cancelada') {
      await transaction.rollback();
      return res.json({
        success: true,
        message: 'La venta ya estaba cancelada',
        data: { id: sale.id, status: 'cancelada' },
        warnings: []
      });
    }

    // Restaurar stock de productos y registrar advertencias
    const warnings = [];
    for (const detail of sale.details) {
      const product = detail.product;
      
      if (product && product.isActive) {
        // Producto activo: restaurar stock normalmente
        await product.update({
          stock: product.stock + detail.quantity
        }, { transaction });
      } else if (product) {
        // Producto inactivo: registrar advertencia
        const warning = `No se pudo restaurar el stock de "${product.name}" porque el producto está inactivo`;
        warnings.push(warning);
      } else {
        // Producto no encontrado: registrar advertencia
        const warning = `No se pudo restaurar el stock del producto porque no se encontró`;
        warnings.push(warning);
      }
    }

    // Actualizar estadísticas del cliente
    if (sale.customer) {
      const newTotal = Math.max(0, parseFloat(sale.customer.totalPurchases) - parseFloat(sale.total));
      await sale.customer.update({
        totalPurchases: newTotal
      }, { transaction });
    }

    // Marcar venta como cancelada
    await sale.update({
      status: 'cancelada'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: warnings.length > 0 
        ? `Venta cancelada exitosamente. Advertencias: ${warnings.join('; ')}`
        : 'Venta cancelada exitosamente',
      data: { id: sale.id, status: 'cancelada' },
      warnings: warnings
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSalesStats
};
