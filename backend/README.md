# Sistema de Inventario y Ventas - Backend

Sistema completo de gestión de inventario con módulo de ventas desarrollado en Node.js, Express y MySQL.

## 🚀 Características

- **Gestión de Usuarios**: Sistema de autenticación con roles (admin, manager, employee)
- **Gestión de Categorías**: Organización de productos por categorías
- **Gestión de Productos**: CRUD completo con control de stock automático
- **Gestión de Clientes**: Base de datos de clientes con historial de compras
- **Sistema de Ventas**: Registro de ventas con actualización automática de inventario
- **Reportes**: Dashboard y reportes detallados de ventas e inventario
- **API RESTful**: Endpoints bien documentados y validaciones robustas

## 📋 Requisitos

- Node.js 16.x o superior
- MySQL 8.0 o superior
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   - Crear una base de datos MySQL llamada `inventory_sales`
   - Configurar las credenciales en el archivo `.env`

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar el archivo `.env` con tu configuración:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=inventory_sales
   DB_USER=tu_usuario
   DB_PASS=tu_contraseña
   JWT_SECRET=tu_clave_secreta
   ```

5. **Ejecutar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema con roles
- **categories**: Categorías de productos
- **products**: Productos con control de stock
- **customers**: Base de datos de clientes
- **sales**: Registros de ventas
- **sale_details**: Detalles de cada venta

### Relaciones

```
users (1:n) categories
users (1:n) products
users (1:n) customers
users (1:n) sales
categories (1:n) products
customers (1:n) sales
sales (1:n) sale_details
products (1:n) sale_details
```

## 🔑 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Todos los endpoints (excepto login y register) requieren autenticación.

### Roles de Usuario

- **admin**: Acceso completo al sistema
- **manager**: Gestión de inventario y reportes
- **employee**: Operaciones básicas de ventas

## 📡 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /register` - Registrar nuevo usuario (solo admin)
- `POST /login` - Iniciar sesión
- `GET /profile` - Obtener perfil del usuario actual
- `PUT /profile` - Actualizar perfil
- `PUT /change-password` - Cambiar contraseña

### Usuarios (`/api/users`) - Solo Admin
- `GET /` - Listar usuarios
- `GET /:id` - Obtener usuario por ID
- `POST /` - Crear usuario
- `PUT /:id` - Actualizar usuario
- `DELETE /:id` - Eliminar usuario
- `PUT /:id/change-password` - Cambiar contraseña de usuario

### Categorías (`/api/categories`)
- `GET /` - Listar categorías
- `GET /active` - Listar categorías activas
- `GET /stats` - Estadísticas de categorías
- `GET /:id` - Obtener categoría por ID
- `POST /` - Crear categoría (admin/manager)
- `PUT /:id` - Actualizar categoría (admin/manager)
- `DELETE /:id` - Eliminar categoría (admin/manager)

### Productos (`/api/products`)
- `GET /` - Listar productos (con filtros)
- `GET /low-stock` - Productos con stock bajo
- `GET /:id` - Obtener producto por ID
- `POST /` - Crear producto (admin/manager)
- `PUT /:id` - Actualizar producto (admin/manager)
- `PUT /:id/stock` - Actualizar stock (admin/manager)
- `DELETE /:id` - Eliminar producto (admin/manager)

### Clientes (`/api/customers`)
- `GET /` - Listar clientes
- `GET /active` - Listar clientes activos
- `GET /:id` - Obtener cliente por ID
- `GET /:id/stats` - Estadísticas del cliente
- `POST /` - Crear cliente
- `PUT /:id` - Actualizar cliente
- `DELETE /:id` - Eliminar cliente (admin/manager)

### Ventas (`/api/sales`)
- `GET /` - Listar ventas (con filtros)
- `GET /stats` - Estadísticas de ventas
- `GET /:id` - Obtener venta por ID
- `POST /` - Crear venta
- `PUT /:id` - Actualizar venta (admin/manager)

### Reportes (`/api/reports`)
- `GET /dashboard` - Estadísticas del dashboard
- `GET /sales` - Reporte de ventas (admin/manager)
- `GET /inventory` - Reporte de inventario (admin/manager)
- `GET /top-products` - Productos más vendidos (admin/manager)
- `GET /customers` - Reporte de clientes (admin/manager)

## 📊 Ejemplos de Uso

### Crear una venta
```javascript
POST /api/sales
{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 150.00,
      "discount": 0
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 250.00,
      "discount": 10.00
    }
  ],
  "tax": 64.00,
  "discount": 0,
  "paymentMethod": "tarjeta",
  "notes": "Venta con descuento especial"
}
```

### Filtrar productos
```
GET /api/products?search=laptop&categoryId=1&lowStock=true&page=1&limit=10
```

### Generar reporte de ventas
```
GET /api/reports/sales?dateFrom=2024-01-01&dateTo=2024-12-31&groupBy=month
```

## 🔒 Seguridad

- Autenticación JWT con expiración configurable
- Validación de datos en todos los endpoints
- Encriptación de contraseñas con bcrypt
- Control de acceso basado en roles
- Middleware de manejo de errores

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── db.config.js          # Configuración de MySQL/Sequelize
├── controllers/
│   ├── auth.controller.js    # Controlador de autenticación
│   ├── user.controller.js    # Controlador de usuarios
│   ├── category.controller.js # Controlador de categorías
│   ├── product.controller.js # Controlador de productos
│   ├── customer.controller.js # Controlador de clientes
│   ├── sale.controller.js    # Controlador de ventas
│   └── report.controller.js  # Controlador de reportes
├── middleware/
│   └── auth.middleware.js    # Middleware de autenticación
├── models/
│   ├── index.js             # Configuración de modelos y relaciones
│   ├── User.js              # Modelo de usuarios
│   ├── Category.js          # Modelo de categorías
│   ├── Product.js           # Modelo de productos
│   ├── Customer.js          # Modelo de clientes
│   ├── Sale.js              # Modelo de ventas
│   └── SaleDetail.js        # Modelo de detalles de venta
├── routes/
│   ├── auth.routes.js       # Rutas de autenticación
│   ├── user.routes.js       # Rutas de usuarios
│   ├── category.routes.js   # Rutas de categorías
│   ├── product.routes.js    # Rutas de productos
│   ├── customer.routes.js   # Rutas de clientes
│   ├── sale.routes.js       # Rutas de ventas
│   └── report.routes.js     # Rutas de reportes
├── .env.example             # Ejemplo de variables de entorno
├── .env                     # Variables de entorno
├── package.json             # Dependencias y scripts
├── server.js                # Punto de entrada del servidor
└── README.md                # Documentación
```

## 🚀 Scripts NPM

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm test` - Ejecutar pruebas (pendiente)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ por el equipo TUKI**
