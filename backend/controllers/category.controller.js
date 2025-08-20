const { validationResult } = require('express-validator');
const { Category, User, Product } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db.config');

// Obtener todas las categorías
const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: categories } = await Category.findAndCountAll({
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
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las categorías activas (para select)
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error al obtener categorías activas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener categoría por ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'sku', 'price', 'stock', 'isActive']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nueva categoría
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, description, isActive } = req.body;

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({
      where: { name: { [Op.like]: name } }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    // Crear categoría
    const category = await Category.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    // Obtener categoría con relaciones
    const categoryWithRelations = await Category.findByPk(category.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoryWithRelations
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
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
    const { name, description, isActive } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si el nombre ya existe (excepto la categoría actual)
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        where: { 
          name: { [Op.like]: name },
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    // Actualizar categoría
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    // Obtener categoría actualizada con relaciones
    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'username']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar categoría (soft delete)
const deleteCategory = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { force = false } = req.query; // Parámetro para forzar eliminación con productos

    const category = await Category.findByPk(id);

    if (!category) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si la categoría tiene productos asociados
    const productsCount = await Product.count({
      where: { categoryId: id, isActive: true }
    });

    if (productsCount > 0) {
      if (force === 'true') {
        // Inactivar también todos los productos de esta categoría
        await Product.update(
          { isActive: false },
          { 
            where: { categoryId: id, isActive: true },
            transaction
          }
        );
        
        // Soft delete - marcar categoría como inactiva
        await category.update({ isActive: false }, { transaction });

        await transaction.commit();

        return res.json({
          success: true,
          message: `Categoría eliminada exitosamente. También se inactivaron ${productsCount} producto(s) asociado(s).`
        });
      } else {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) activo(s) asociado(s). ¿Desea inactivar también los productos?`,
          productsCount,
          needsConfirmation: true
        });
      }
    }

    // Si no tiene productos activos, eliminar normalmente
    await category.update({ isActive: false }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de categorías
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('products.id')), 'productsCount'],
        [sequelize.fn('SUM', sequelize.col('products.stock')), 'totalStock']
      ],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: [],
          where: { isActive: true },
          required: false
        }
      ],
      where: { isActive: true },
      group: ['Category.id', 'Category.name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};
