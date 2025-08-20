const { sequelize } = require('../config/db.config');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Customer = require('./Customer');
const Sale = require('./Sale');
const SaleDetail = require('./SaleDetail');

// Definir relaciones
// User relationships
User.hasMany(Category, { foreignKey: 'createdBy', as: 'categories' });
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' });
User.hasMany(Customer, { foreignKey: 'createdBy', as: 'customers' });
User.hasMany(Sale, { foreignKey: 'createdBy', as: 'sales' });

// Category relationships
Category.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Product relationships
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(SaleDetail, { foreignKey: 'productId', as: 'saleDetails' });

// Customer relationships
Customer.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });

// Sale relationships
Sale.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Sale.hasMany(SaleDetail, { foreignKey: 'saleId', as: 'details' });

// SaleDetail relationships
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Customer,
  Sale,
  SaleDetail
};
