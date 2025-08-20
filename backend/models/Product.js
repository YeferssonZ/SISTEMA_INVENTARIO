const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },
  maxStock: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    validate: {
      min: 0
    }
  },
  unit: {
    type: DataTypes.ENUM('pza', 'kg', 'lt', 'mt', 'caja', 'paquete'),
    defaultValue: 'pza'
  },
  barcode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['sku'], unique: true },
    { fields: ['categoryId'] },
    { fields: ['isActive'] }
  ]
});

// Métodos virtuales
Product.prototype.getProfitMargin = function() {
  return ((this.price - this.cost) / this.cost) * 100;
};

Product.prototype.getStockStatus = function() {
  if (this.stock <= 0) return 'sin_stock';
  if (this.stock <= this.minStock) return 'stock_bajo';
  if (this.stock >= this.maxStock) return 'stock_alto';
  return 'normal';
};

module.exports = Product;
