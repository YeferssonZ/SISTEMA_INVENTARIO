require('dotenv').config();
const { sequelize, User, Category, Product, Customer } = require('../models');
const bcrypt = require('bcryptjs');

const initializeData = async () => {
  try {
    console.log('🔄 Inicializando datos de ejemplo...');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: true }); // ⚠️ Esto elimina y recrea las tablas
    console.log('✅ Tablas creadas/actualizadas');

    // Crear usuario administrador
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@tuki.com',
      password: 'admin123', // Se hasheará automáticamente
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Usuario administrador creado');

    // Crear usuario manager
    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@tuki.com',
      password: 'manager123',
      firstName: 'Gerente',
      lastName: 'Ventas',
      role: 'manager',
      isActive: true
    });

    // Crear usuario empleado
    const employeeUser = await User.create({
      username: 'empleado',
      email: 'empleado@tuki.com',
      password: 'empleado123',
      firstName: 'Juan',
      lastName: 'Vendedor',
      role: 'employee',
      isActive: true
    });

    console.log('✅ Usuarios adicionales creados');

    // Crear categorías
    const categories = await Category.bulkCreate([
      {
        name: 'Electrónicos',
        description: 'Productos electrónicos y tecnológicos',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Hogar',
        description: 'Artículos para el hogar y decoración',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Ropa',
        description: 'Vestimenta y accesorios',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Deportes',
        description: 'Artículos deportivos y fitness',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Libros',
        description: 'Libros y material educativo',
        isActive: true,
        createdBy: adminUser.id
      }
    ]);
    console.log('✅ Categorías creadas');

    // Crear productos
    const products = await Product.bulkCreate([
      {
        name: 'Laptop HP Pavilion',
        description: 'Laptop HP Pavilion 15.6" Intel Core i5 8GB RAM 512GB SSD',
        sku: 'LAPTOP-HP-001',
        categoryId: categories[0].id, // Electrónicos
        price: 15999.00,
        cost: 12000.00,
        stock: 10,
        minStock: 2,
        maxStock: 50,
        unit: 'pza',
        barcode: '7501234567890',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Mouse Inalámbrico',
        description: 'Mouse inalámbrico óptico 2.4GHz',
        sku: 'MOUSE-WRL-001',
        categoryId: categories[0].id,
        price: 299.00,
        cost: 180.00,
        stock: 25,
        minStock: 5,
        maxStock: 100,
        unit: 'pza',
        barcode: '7501234567891',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Teclado Mecánico',
        description: 'Teclado mecánico RGB retroiluminado',
        sku: 'KEYB-MECH-001',
        categoryId: categories[0].id,
        price: 1299.00,
        cost: 800.00,
        stock: 15,
        minStock: 3,
        maxStock: 30,
        unit: 'pza',
        barcode: '7501234567892',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Juego de Toallas',
        description: 'Juego de 3 toallas de algodón 100%',
        sku: 'TOWEL-SET-001',
        categoryId: categories[1].id, // Hogar
        price: 450.00,
        cost: 200.00,
        stock: 30,
        minStock: 10,
        maxStock: 100,
        unit: 'pza',
        barcode: '7501234567893',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Lámpara de Mesa',
        description: 'Lámpara de mesa LED regulable',
        sku: 'LAMP-LED-001',
        categoryId: categories[1].id,
        price: 850.00,
        cost: 400.00,
        stock: 20,
        minStock: 5,
        maxStock: 50,
        unit: 'pza',
        barcode: '7501234567894',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Camisa Casual',
        description: 'Camisa casual de algodón talla M',
        sku: 'SHIRT-CAS-M01',
        categoryId: categories[2].id, // Ropa
        price: 550.00,
        cost: 250.00,
        stock: 40,
        minStock: 10,
        maxStock: 80,
        unit: 'pza',
        barcode: '7501234567895',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Jeans Mezclilla',
        description: 'Jeans de mezclilla azul talla 32',
        sku: 'JEANS-BLU-32',
        categoryId: categories[2].id,
        price: 899.00,
        cost: 450.00,
        stock: 25,
        minStock: 8,
        maxStock: 60,
        unit: 'pza',
        barcode: '7501234567896',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Pelota de Fútbol',
        description: 'Pelota de fútbol oficial FIFA',
        sku: 'BALL-FOOT-001',
        categoryId: categories[3].id, // Deportes
        price: 350.00,
        cost: 180.00,
        stock: 35,
        minStock: 12,
        maxStock: 80,
        unit: 'pza',
        barcode: '7501234567897',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Libro de Programación',
        description: 'JavaScript: The Good Parts',
        sku: 'BOOK-JS-001',
        categoryId: categories[4].id, // Libros
        price: 650.00,
        cost: 400.00,
        stock: 15,
        minStock: 5,
        maxStock: 30,
        unit: 'pza',
        barcode: '9781234567890',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Audífonos Bluetooth',
        description: 'Audífonos inalámbricos con cancelación de ruido',
        sku: 'HEADP-BT-001',
        categoryId: categories[0].id, // Electrónicos
        price: 2500.00,
        cost: 1500.00,
        stock: 12,
        minStock: 3,
        maxStock: 25,
        unit: 'pza',
        barcode: '7501234567898',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Monitor 24 pulgadas',
        description: 'Monitor LED 24" Full HD 1920x1080',
        sku: 'MON-24-001',
        categoryId: categories[0].id,
        price: 3200.00,
        cost: 2400.00,
        stock: 2, // Stock bajo para testing
        minStock: 5,
        maxStock: 20,
        unit: 'pza',
        barcode: '7501234567899',
        isActive: true,
        createdBy: adminUser.id
      }
    ]);
    console.log('✅ Productos creados');

    // Crear clientes
    const customers = await Customer.bulkCreate([
      {
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@email.com',
        phone: '555-0101',
        street: 'Av. Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '01000',
        country: 'México',
        customerType: 'individual',
        rfc: 'PEGJ850315AB1',
        companyName: null,
        isActive: true,
        totalPurchases: 0.00,
        lastPurchaseDate: null,
        notes: 'Cliente frecuente',
        createdBy: adminUser.id
      },
      {
        firstName: 'María',
        lastName: 'López Hernández',
        email: 'maria.lopez@email.com',
        phone: '555-0102',
        street: 'Calle Reforma 456',
        city: 'Guadalajara',
        state: 'Jalisco',
        zipCode: '44100',
        country: 'México',
        customerType: 'individual',
        rfc: 'LOHM920820CD2',
        companyName: null,
        isActive: true,
        totalPurchases: 0.00,
        lastPurchaseDate: null,
        notes: null,
        createdBy: adminUser.id
      },
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez Silva',
        email: 'carlos.rodriguez@email.com',
        phone: '555-0103',
        street: 'Blvd. Tecnológico 789',
        city: 'Monterrey',
        state: 'Nuevo León',
        zipCode: '64700',
        country: 'México',
        customerType: 'individual',
        rfc: 'ROSC780425EF3',
        companyName: null,
        isActive: true,
        totalPurchases: 0.00,
        lastPurchaseDate: null,
        notes: null,
        createdBy: adminUser.id
      },
      {
        firstName: 'Ana',
        lastName: 'Martínez Jiménez',
        email: 'ana.martinez@email.com',
        phone: '555-0104',
        street: 'Av. Universidad 321',
        city: 'Puebla',
        state: 'Puebla',
        zipCode: '72000',
        country: 'México',
        customerType: 'individual',
        rfc: 'MAJA901010GH4',
        companyName: null,
        isActive: true,
        totalPurchases: 0.00,
        lastPurchaseDate: null,
        notes: 'Cliente VIP',
        createdBy: adminUser.id
      },
      {
        firstName: 'Tecnología',
        lastName: 'SA',
        email: 'contacto@tecnologia.com',
        phone: '555-0201',
        street: 'Av. Corporativa 1000',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '01010',
        country: 'México',
        customerType: 'empresa',
        rfc: 'TEC121212IJ5',
        companyName: 'Tecnología SA de CV',
        isActive: true,
        totalPurchases: 0.00,
        lastPurchaseDate: null,
        notes: 'Empresa cliente',
        createdBy: adminUser.id
      }
    ]);
    console.log('✅ Clientes creados');

    console.log('\n🎉 Datos de ejemplo inicializados exitosamente!');
    console.log('\n📝 Usuarios creados:');
    console.log('   👤 Admin: admin@tuki.com / admin123');
    console.log('   👤 Manager: manager@tuki.com / manager123');
    console.log('   👤 Empleado: empleado@tuki.com / empleado123');
    console.log('\n📊 Datos creados:');
    console.log(`   📁 ${categories.length} categorías`);
    console.log(`   📦 ${products.length} productos`);
    console.log(`   👥 ${customers.length} clientes`);
    console.log('\n✨ Sistema listo para usar!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeData();
}

module.exports = initializeData;
