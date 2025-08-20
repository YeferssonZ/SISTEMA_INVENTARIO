-- Script de inicialización de la base de datos
-- Sistema de Inventario y Ventas

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS inventory_sales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventory_sales;

-- Habilitar eventos (para la creación automática de números de venta)
SET GLOBAL event_scheduler = ON;

-- Las tablas se crearán automáticamente con Sequelize sync()
-- Este script incluye datos de ejemplo para testing

-- Insertar usuario administrador por defecto (después de que Sequelize cree las tablas)
-- Nota: La contraseña será hasheada automáticamente por el modelo
-- Contraseña por defecto: "admin123"

-- Datos de ejemplo de categorías
INSERT INTO categories (name, description, isActive, createdBy, createdAt, updatedAt) VALUES
('Electrónicos', 'Productos electrónicos y tecnológicos', true, 1, NOW(), NOW()),
('Hogar', 'Artículos para el hogar y decoración', true, 1, NOW(), NOW()),
('Ropa', 'Vestimenta y accesorios', true, 1, NOW(), NOW()),
('Deportes', 'Artículos deportivos y fitness', true, 1, NOW(), NOW()),
('Libros', 'Libros y material educativo', true, 1, NOW(), NOW());

-- Datos de ejemplo de productos
INSERT INTO products (name, description, sku, categoryId, price, cost, stock, minStock, maxStock, unit, barcode, isActive, createdBy, createdAt, updatedAt) VALUES
('Laptop HP Pavilion', 'Laptop HP Pavilion 15.6" Intel Core i5 8GB RAM 512GB SSD', 'LAPTOP-HP-001', 1, 15999.00, 12000.00, 10, 2, 50, 'pza', '7501234567890', true, 1, NOW(), NOW()),
('Mouse Inalámbrico', 'Mouse inalámbrico óptico 2.4GHz', 'MOUSE-WRL-001', 1, 299.00, 180.00, 25, 5, 100, 'pza', '7501234567891', true, 1, NOW(), NOW()),
('Teclado Mecánico', 'Teclado mecánico RGB retroiluminado', 'KEYB-MECH-001', 1, 1299.00, 800.00, 15, 3, 30, 'pza', '7501234567892', true, 1, NOW(), NOW()),
('Juego de Toallas', 'Juego de 3 toallas de algodón 100%', 'TOWEL-SET-001', 2, 450.00, 200.00, 30, 10, 100, 'pza', '7501234567893', true, 1, NOW(), NOW()),
('Lámpara de Mesa', 'Lámpara de mesa LED regulable', 'LAMP-LED-001', 2, 850.00, 400.00, 20, 5, 50, 'pza', '7501234567894', true, 1, NOW(), NOW()),
('Camisa Casual', 'Camisa casual de algodón talla M', 'SHIRT-CAS-M01', 3, 550.00, 250.00, 40, 10, 80, 'pza', '7501234567895', true, 1, NOW(), NOW()),
('Jeans Mezclilla', 'Jeans de mezclilla azul talla 32', 'JEANS-BLU-32', 3, 899.00, 450.00, 25, 8, 60, 'pza', '7501234567896', true, 1, NOW(), NOW()),
('Pelota de Fútbol', 'Pelota de fútbol oficial FIFA', 'BALL-FOOT-001', 4, 350.00, 180.00, 35, 12, 80, 'pza', '7501234567897', true, 1, NOW(), NOW()),
('Libro de Programación', 'JavaScript: The Good Parts', 'BOOK-JS-001', 5, 650.00, 400.00, 15, 5, 30, 'pza', '9781234567890', true, 1, NOW(), NOW()),
('Audífonos Bluetooth', 'Audífonos inalámbricos con cancelación de ruido', 'HEADP-BT-001', 1, 2500.00, 1500.00, 12, 3, 25, 'pza', '7501234567898', true, 1, NOW(), NOW());

-- Datos de ejemplo de clientes
INSERT INTO customers (firstName, lastName, email, phone, street, city, state, zipCode, country, customerType, rfc, companyName, isActive, totalPurchases, lastPurchaseDate, notes, createdBy, createdAt, updatedAt) VALUES
('Juan', 'Pérez García', 'juan.perez@email.com', '555-0101', 'Av. Principal 123', 'Ciudad de México', 'CDMX', '01000', 'México', 'individual', 'PEGJ850315AB1', NULL, true, 0.00, NULL, 'Cliente frecuente', 1, NOW(), NOW()),
('María', 'López Hernández', 'maria.lopez@email.com', '555-0102', 'Calle Reforma 456', 'Guadalajara', 'Jalisco', '44100', 'México', 'individual', 'LOHM920820CD2', NULL, true, 0.00, NULL, NULL, 1, NOW(), NOW()),
('Carlos', 'Rodríguez Silva', 'carlos.rodriguez@email.com', '555-0103', 'Blvd. Tecnológico 789', 'Monterrey', 'Nuevo León', '64700', 'México', 'individual', 'ROSC780425EF3', NULL, true, 0.00, NULL, NULL, 1, NOW(), NOW()),
('Ana', 'Martínez Jiménez', 'ana.martinez@email.com', '555-0104', 'Av. Universidad 321', 'Puebla', 'Puebla', '72000', 'México', 'individual', 'MAJA901010GH4', NULL, true, 0.00, NULL, 'Cliente VIP', 1, NOW(), NOW()),
('Tecnología SA', 'Empresa', 'contacto@tecnologia.com', '555-0201', 'Av. Corporativa 1000', 'Ciudad de México', 'CDMX', '01010', 'México', 'empresa', 'TEC121212IJ5', 'Tecnología SA de CV', true, 0.00, NULL, 'Empresa cliente', 1, NOW(), NOW());

-- Función para obtener el siguiente número de venta
DELIMITER //

CREATE FUNCTION GetNextSaleNumber() 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_number VARCHAR(20);
    DECLARE sequence_num INT;
    DECLARE date_prefix VARCHAR(10);
    
    SET date_prefix = CONCAT('V', DATE_FORMAT(NOW(), '%Y%m%d'));
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(saleNumber, 10) AS UNSIGNED)), 0) + 1 
    INTO sequence_num
    FROM sales 
    WHERE saleNumber LIKE CONCAT(date_prefix, '%');
    
    SET next_number = CONCAT(date_prefix, LPAD(sequence_num, 4, '0'));
    
    RETURN next_number;
END //

DELIMITER ;

-- Trigger para generar automáticamente el número de venta
DELIMITER //

CREATE TRIGGER before_sale_insert 
BEFORE INSERT ON sales
FOR EACH ROW
BEGIN
    IF NEW.saleNumber IS NULL OR NEW.saleNumber = '' THEN
        SET NEW.saleNumber = GetNextSaleNumber();
    END IF;
END //

DELIMITER ;

-- Índices adicionales para optimización
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock_status ON products(stock, minStock);
CREATE INDEX idx_customers_name ON customers(firstName, lastName);
CREATE INDEX idx_sales_date ON sales(saleDate);
CREATE INDEX idx_sales_customer ON sales(customerId);
CREATE INDEX idx_sale_details_product ON sale_details(productId);

-- Vista para productos con stock bajo
CREATE VIEW low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock,
    p.minStock,
    p.price,
    c.name as category_name,
    CASE 
        WHEN p.stock = 0 THEN 'Sin Stock'
        WHEN p.stock <= p.minStock THEN 'Stock Bajo'
        ELSE 'Normal'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.categoryId = c.id
WHERE p.isActive = true 
AND p.stock <= p.minStock;

-- Vista para reporte de ventas
CREATE VIEW sales_summary AS
SELECT 
    s.id,
    s.saleNumber,
    s.saleDate,
    s.total,
    s.status,
    CONCAT(c.firstName, ' ', c.lastName) as customer_name,
    c.email as customer_email,
    CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
    COUNT(sd.id) as items_count
FROM sales s
LEFT JOIN customers c ON s.customerId = c.id
LEFT JOIN users u ON s.createdBy = u.id
LEFT JOIN sale_details sd ON s.id = sd.saleId
GROUP BY s.id, s.saleNumber, s.saleDate, s.total, s.status, c.firstName, c.lastName, c.email, u.firstName, u.lastName;

-- Insertar usuario administrador por defecto
-- Nota: Este usuario se debe crear después de que las tablas estén creadas
-- La contraseña 'admin123' será hasheada automáticamente por la aplicación

-- Comentarios para el desarrollador:
-- 1. Ejecutar primero: npm run dev para crear las tablas
-- 2. Luego crear el usuario admin manualmente o usar el endpoint de registro
-- 3. Ejecutar este script para insertar los datos de ejemplo

COMMIT;
