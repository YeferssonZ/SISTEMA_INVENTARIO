const { validationResult } = require('express-validator');
const { Product, Category, User, SaleDetail } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db.config');

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      categoryId, 
      isActive, 
      lowStock,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (lowStock === 'true') {
      where[Op.and] = sequelize.where(
        sequelize.col('Product.stock'), 
        Op.lte, 
        sequelize.col('Product.minStock')
      );
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
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

    // Agregar información adicional a cada producto
    const productsWithInfo = products.map(product => {
      const productData = product.toJSON();
      productData.profitMargin = product.getProfitMargin();
      productData.stockStatus = product.getStockStatus();
      return productData;
    });

    res.json({
      success: true,
      data: {
        products: productsWithInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener productos con stock bajo
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          sequelize.where(
            sequelize.col('stock'), 
            '<=', 
            sequelize.col('minStock')
          )
        ]
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['stock', 'ASC']]
    });

    const productsWithInfo = products.map(product => {
      const productData = product.toJSON();
      productData.stockStatus = product.getStockStatus();
      return productData;
    });

    res.json({
      success: true,
      data: productsWithInfo
    });

  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener producto por ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const productData = product.toJSON();
    productData.profitMargin = product.getProfitMargin();
    productData.stockStatus = product.getStockStatus();

    res.json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo producto
const createProduct = async (req, res) => {
  try {
    console.log('Datos recibidos para crear producto:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      name, description, sku, categoryId, price, cost, stock,
      minStock, maxStock, unit, barcode, isActive
    } = req.body;

    // Verificar si el SKU ya existe
    const existingSku = await Product.findOne({
      where: { sku: { [Op.like]: sku } }
    });

    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con ese SKU'
      });
    }

    // Verificar si el código de barras ya existe (si se proporciona)
    if (barcode) {
      const existingBarcode = await Product.findOne({
        where: { barcode }
      });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese código de barras'
        });
      }
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'La categoría especificada no existe'
      });
    }

    // Crear producto
    const product = await Product.create({
      name,
      description,
      sku: sku.toUpperCase(),
      categoryId,
      price,
      cost: cost || 0,
      stock: stock || 0,
      minStock: minStock || 5,
      maxStock: maxStock || 1000,
      unit: unit || 'pza',
      barcode,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    // Obtener producto con relaciones
    const productWithRelations = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    const productData = productWithRelations.toJSON();
    productData.profitMargin = productWithRelations.getProfitMargin();
    productData.stockStatus = productWithRelations.getStockStatus();

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: productData
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar producto
const updateProduct = async (req, res) => {
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
      name, description, sku, categoryId, price, cost, stock,
      minStock, maxStock, unit, barcode, isActive
    } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar si el SKU ya existe (excepto el producto actual)
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({
        where: { 
          sku: { [Op.like]: sku },
          id: { [Op.ne]: id }
        }
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese SKU'
        });
      }
    }

    // Verificar si el código de barras ya existe (excepto el producto actual)
    if (barcode && barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({
        where: { 
          barcode,
          id: { [Op.ne]: id }
        }
      });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un producto con ese código de barras'
        });
      }
    }

    // Verificar que la categoría existe (si se proporciona)
    if (categoryId && categoryId !== product.categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe'
        });
      }
    }

    // Actualizar producto
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      sku: sku ? sku.toUpperCase() : product.sku,
      categoryId: categoryId || product.categoryId,
      price: price !== undefined ? price : product.price,
      cost: cost !== undefined ? cost : product.cost,
      stock: stock !== undefined ? stock : product.stock,
      minStock: minStock !== undefined ? minStock : product.minStock,
      maxStock: maxStock !== undefined ? maxStock : product.maxStock,
      unit: unit || product.unit,
      barcode: barcode !== undefined ? barcode : product.barcode,
      isActive: isActive !== undefined ? isActive : product.isActive
    });

    // Obtener producto actualizado con relaciones
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    const productData = updatedProduct.toJSON();
    productData.profitMargin = updatedProduct.getProfitMargin();
    productData.stockStatus = updatedProduct.getStockStatus();

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productData
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar stock del producto
const updateStock = async (req, res) => {
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
    const { quantity, type, reason } = req.body; // type: 'add' | 'subtract' | 'set'

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    let newStock = product.stock;

    switch (type) {
      case 'add':
        newStock += quantity;
        break;
      case 'subtract':
        newStock -= quantity;
        if (newStock < 0) {
          return res.status(400).json({
            success: false,
            message: 'No hay suficiente stock disponible'
          });
        }
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de operación inválido'
        });
    }

    await product.update({ stock: newStock });

    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: {
        previousStock: product.stock,
        newStock,
        difference: newStock - product.stock,
        reason
      }
    });

  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar producto (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar si el producto tiene ventas asociadas
    const salesCount = await SaleDetail.count({
      where: { productId: id }
    });

    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el producto porque tiene ${salesCount} venta(s) asociada(s). Se marcará como inactivo.`
      });
    }

    // Soft delete - marcar como inactivo
    await product.update({ isActive: false });

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
};
