const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  street: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(50),
    defaultValue: 'México'
  },
  customerType: {
    type: DataTypes.ENUM('individual', 'empresa'),
    defaultValue: 'individual'
  },
  rfc: {
    type: DataTypes.STRING(15),
    allowNull: true,
    unique: true
  },
  companyName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  totalPurchases: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  lastPurchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  tableName: 'customers',
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['isActive'] }
  ]
});

// Métodos virtuales
Customer.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Customer.prototype.getFullAddress = function() {
  const parts = [
    this.street,
    this.city,
    this.state,
    this.zipCode,
    this.country
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
};

module.exports = Customer;
