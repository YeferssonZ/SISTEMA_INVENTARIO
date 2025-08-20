const { validationResult } = require('express-validator');
const { Customer, User, Sale } = require('../models');
const { Op, sequelize } = require('sequelize');

// Obtener todos los clientes
const getCustomers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      customerType, 
      isActive,
      sortBy = 'firstName',
      sortOrder = 'ASC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { rfc: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } }
      ];
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: customers } = await Customer.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    // Agregar información adicional a cada cliente
    const customersWithInfo = customers.map(customer => {
      const customerData = customer.toJSON();
      customerData.fullName = customer.getFullName();
      customerData.fullAddress = customer.getFullAddress();
      return customerData;
    });

    res.json({
      success: true,
      data: {
        customers: customersWithInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener clientes activos (para select)
const getActiveCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    const customersWithNames = customers.map(customer => {
      const customerData = customer.toJSON();
      customerData.fullName = customer.getFullName();
      return customerData;
    });

    res.json({
      success: true,
      data: customersWithNames
    });

  } catch (error) {
    console.error('Error al obtener clientes activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener cliente por ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Sale,
          as: 'sales',
          attributes: ['id', 'saleNumber', 'saleDate', 'total', 'status'],
          limit: 10,
          order: [['saleDate', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const customerData = customer.toJSON();
    customerData.fullName = customer.getFullName();
    customerData.fullAddress = customer.getFullAddress();

    res.json({
      success: true,
      data: customerData
    });

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo cliente
const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      firstName, lastName, email, phone, street, city, state, zipCode, country,
      customerType, rfc, companyName, notes, isActive
    } = req.body;

    // Verificar si el email ya existe (si se proporciona)
    if (email) {
      const existingEmail = await Customer.findOne({
        where: { email: { [Op.like]: email } }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese email'
        });
      }
    }

    // Verificar si el RFC ya existe (si se proporciona)
    if (rfc) {
      const existingRfc = await Customer.findOne({
        where: { rfc: { [Op.like]: rfc } }
      });

      if (existingRfc) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese RFC'
        });
      }
    }

    // Crear cliente
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipCode,
      country: country || 'México',
      customerType: customerType || 'individual',
      rfc: rfc ? rfc.toUpperCase() : null,
      companyName,
      notes,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    // Obtener cliente con relaciones
    const customerWithRelations = await Customer.findByPk(customer.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    const customerData = customerWithRelations.toJSON();
    customerData.fullName = customerWithRelations.getFullName();
    customerData.fullAddress = customerWithRelations.getFullAddress();

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: customerData
    });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar cliente
const updateCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      firstName, lastName, email, phone, street, city, state, zipCode, country,
      customerType, rfc, companyName, notes, isActive
    } = req.body;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar si el email ya existe (excepto el cliente actual)
    if (email && email.toLowerCase() !== customer.email?.toLowerCase()) {
      const existingEmail = await Customer.findOne({
        where: { 
          email: { [Op.like]: email },
          id: { [Op.ne]: id }
        }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese email'
        });
      }
    }

    // Verificar si el RFC ya existe (excepto el cliente actual)
    if (rfc && rfc.toUpperCase() !== customer.rfc?.toUpperCase()) {
      const existingRfc = await Customer.findOne({
        where: { 
          rfc: { [Op.like]: rfc },
          id: { [Op.ne]: id }
        }
      });

      if (existingRfc) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con ese RFC'
        });
      }
    }

    // Actualizar cliente
    await customer.update({
      firstName: firstName || customer.firstName,
      lastName: lastName || customer.lastName,
      email: email !== undefined ? email : customer.email,
      phone: phone || customer.phone,
      street: street !== undefined ? street : customer.street,
      city: city !== undefined ? city : customer.city,
      state: state !== undefined ? state : customer.state,
      zipCode: zipCode !== undefined ? zipCode : customer.zipCode,
      country: country || customer.country,
      customerType: customerType || customer.customerType,
      rfc: rfc !== undefined ? (rfc ? rfc.toUpperCase() : null) : customer.rfc,
      companyName: companyName !== undefined ? companyName : customer.companyName,
      notes: notes !== undefined ? notes : customer.notes,
      isActive: isActive !== undefined ? isActive : customer.isActive
    });

    // Obtener cliente actualizado con relaciones
    const updatedCustomer = await Customer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    const customerData = updatedCustomer.toJSON();
    customerData.fullName = updatedCustomer.getFullName();
    customerData.fullAddress = updatedCustomer.getFullAddress();

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: customerData
    });

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar cliente (soft delete)
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Verificar si el cliente tiene ventas asociadas
    const salesCount = await Sale.count({
      where: { customerId: id }
    });

    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el cliente porque tiene ${salesCount} venta(s) asociada(s). Se marcará como inactivo.`
      });
    }

    // Soft delete - marcar como inactivo
    await customer.update({ isActive: false });

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas del cliente
const getCustomerStats = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener estadísticas de ventas
    const salesStats = await Sale.findAll({
      where: { customerId: id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageAmount'],
        [sequelize.fn('MAX', sequelize.col('saleDate')), 'lastSaleDate'],
        [sequelize.fn('MIN', sequelize.col('saleDate')), 'firstSaleDate']
      ],
      raw: true
    });

    // Obtener ventas por mes (últimos 12 meses)
    const salesByMonth = await Sale.findAll({
      where: {
        customerId: id,
        saleDate: {
          [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 12 MONTH)")
        }
      },
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('saleDate')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('saleDate')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'salesCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount']
      ],
      group: [
        sequelize.fn('YEAR', sequelize.col('saleDate')),
        sequelize.fn('MONTH', sequelize.col('saleDate'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('saleDate')), 'DESC'],
        [sequelize.fn('MONTH', sequelize.col('saleDate')), 'DESC']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          fullName: customer.getFullName(),
          email: customer.email,
          phone: customer.phone
        },
        stats: salesStats[0] || {
          totalSales: 0,
          totalAmount: 0,
          averageAmount: 0,
          lastSaleDate: null,
          firstSaleDate: null
        },
        salesByMonth
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getCustomers,
  getActiveCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
};
