const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'inventory_sales',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected successfully');
    
    // Sincronizar modelos con la base de datos
    // Solo forzar recreación si está explícitamente habilitado
    const shouldForce = process.env.FORCE_DB_SYNC === 'true';
    await sequelize.sync({ force: shouldForce, alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
