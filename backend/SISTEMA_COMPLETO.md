# 📦 Sistema de Inventario y Ventas - Documentación Completa

## 🎯 Descripción General del Sistema

Este es un **sistema completo de inventario y ventas** desarrollado para pequeñas y medianas empresas que necesitan controlar su stock, gestionar clientes, procesar ventas y generar reportes básicos.

### 🏗️ Arquitectura del Sistema
- **Backend**: Node.js + Express + MySQL + Sequelize ORM
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Autenticación**: JWT (JSON Web Tokens)
- **Base de Datos**: MySQL 8.0+

---

## 🖥️ BACKEND - API REST (Puerto 3000)

### 📂 Estructura del Backend
```
backend/
├── config/
│   └── db.config.js           # Configuración de MySQL/Sequelize
├── controllers/               # Lógica de negocio
│   ├── auth.controller.js     # Autenticación y autorización
│   ├── category.controller.js # Gestión de categorías
│   ├── customer.controller.js # Gestión de clientes
│   ├── product.controller.js  # Gestión de productos
│   ├── report.controller.js   # Generación de reportes
│   ├── sale.controller.js     # Procesamiento de ventas
│   └── user.controller.js     # Gestión de usuarios
├── middleware/
│   └── auth.middleware.js     # Middleware de autenticación JWT
├── models/                    # Modelos de Sequelize
│   ├── User.js                # Modelo de usuarios
│   ├── Category.js            # Modelo de categorías
│   ├── Product.js             # Modelo de productos
│   ├── Customer.js            # Modelo de clientes
│   ├── Sale.js                # Modelo de ventas
│   ├── SaleDetail.js          # Modelo de detalles de venta
│   └── index.js               # Exportación de modelos
├── routes/                    # Definición de rutas API
│   ├── auth.routes.js         # /api/auth/*
│   ├── category.routes.js     # /api/categories/*
│   ├── customer.routes.js     # /api/customers/*
│   ├── product.routes.js      # /api/products/*
│   ├── report.routes.js       # /api/reports/*
│   ├── sale.routes.js         # /api/sales/*
│   └── user.routes.js         # /api/users/*
├── scripts/
│   └── init-data.js           # Script de inicialización con datos de prueba
├── database/
│   └── init.sql               # SQL inicial (opcional)
├── server.js                  # Punto de entrada del servidor
├── package.json               # Dependencias y scripts
├── .env                       # Variables de entorno
└── .env.example               # Plantilla de variables de entorno
```

### 🔑 Funcionalidades del Backend

#### 1. **Sistema de Autenticación** (`/api/auth`)
- `POST /login` - Inicio de sesión con email/username y contraseña
- `POST /register` - Registro de nuevos usuarios (solo admin)
- `GET /profile` - Obtener perfil del usuario autenticado
- `PUT /profile` - Actualizar perfil del usuario
- `PUT /change-password` - Cambiar contraseña

**Roles de Usuario:**
- **Admin**: Acceso completo al sistema
- **Manager**: Gestión y reportes (sin configuración de usuarios)
- **Employee**: Operaciones básicas (ventas, consultas)

#### 2. **Gestión de Productos** (`/api/products`)
- `GET /` - Listar productos con paginación y filtros
- `GET /:id` - Obtener producto específico
- `POST /` - Crear nuevo producto
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

**Campos de Producto:**
```javascript
{
  id: number,
  name: string,
  description: string,
  price: number,        // Precio de venta
  cost: number,         // Costo del producto
  stock: number,        // Stock actual
  minStock: number,     // Stock mínimo (alerta)
  barcode: string,      // Código de barras (opcional)
  categoryId: number,   // ID de categoría
  isActive: boolean,    // Estado activo/inactivo
}
```

#### 3. **Gestión de Categorías** (`/api/categories`)
- `GET /` - Listar todas las categorías activas
- `POST /` - Crear nueva categoría
- `PUT /:id` - Actualizar categoría
- `DELETE /:id` - Eliminar categoría

#### 4. **Gestión de Clientes** (`/api/customers`)
- `GET /` - Listar clientes con paginación y búsqueda
- `GET /:id` - Obtener cliente específico
- `POST /` - Crear nuevo cliente
- `PUT /:id` - Actualizar cliente
- `DELETE /:id` - Eliminar cliente

#### 5. **Sistema de Ventas** (`/api/sales`)
- `GET /` - Listar ventas con filtros de fecha, cliente, etc.
- `GET /:id` - Obtener venta específica con detalles
- `POST /` - Crear nueva venta (actualiza stock automáticamente)
- `PUT /:id/status` - Actualizar estado de venta
- `DELETE /:id` - Cancelar venta (restaura stock)

**Proceso de Venta:**
1. Seleccionar cliente
2. Agregar productos con cantidades
3. Calcular subtotal, impuestos y total
4. Procesar pago (efectivo, tarjeta, transferencia)
5. Generar factura
6. Actualizar stock automáticamente

#### 6. **Sistema de Reportes** (`/api/reports`)
- `GET /dashboard` - Métricas del dashboard (ventas del día, productos con poco stock)
- `GET /sales-summary` - Resumen de ventas por período
- `GET /top-products` - Productos más vendidos
- `GET /low-stock` - Productos con stock bajo
- `GET /sales-by-period` - Ventas agrupadas por día/mes

### 🗄️ Base de Datos

**Tablas Principales:**
1. **users** - Usuarios del sistema
2. **categories** - Categorías de productos
3. **products** - Catálogo de productos
4. **customers** - Clientes
5. **sales** - Cabecera de ventas
6. **sale_details** - Detalles de cada venta

**Relaciones:**
- `products` → `categories` (N:1)
- `sales` → `customers` (N:1)
- `sales` → `users` (N:1)
- `sale_details` → `sales` (N:1)
- `sale_details` → `products` (N:1)

### ⚙️ Configuración del Backend

**Variables de Entorno (.env):**
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_sales
DB_USER=root
DB_PASS=12345678
JWT_SECRET=sistema_inventario_ventas_secret_key_2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Scripts Disponibles:**
```bash
npm start       # Ejecutar en producción
npm run dev     # Ejecutar en desarrollo con nodemon
npm run init-data # Inicializar datos de prueba
```

**Usuarios de Prueba:**
- **Admin**: admin@tuki.com / admin123
- **Manager**: manager@tuki.com / manager123
- **Employee**: empleado@tuki.com / empleado123

---

## 🎨 FRONTEND - React App (Puerto 5173)

### 📂 Estructura del Frontend
```
frontend/
├── src/
│   ├── assets/               # Imágenes, íconos, logos
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes base (Button, Input, Modal)
│   │   ├── forms/           # Formularios específicos
│   │   └── tables/          # Tablas de datos
│   ├── layouts/             # Layouts principales
│   │   ├── AuthLayout.tsx   # Layout para login/registro
│   │   └── DashboardLayout.tsx # Layout principal con sidebar
│   ├── pages/               # Vistas principales
│   │   ├── auth/           # Login, registro
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── products/       # Gestión de productos
│   │   ├── categories/     # Gestión de categorías
│   │   ├── customers/      # Gestión de clientes
│   │   ├── sales/          # Procesamiento de ventas
│   │   └── reports/        # Reportes y estadísticas
│   ├── services/           # Llamadas a API
│   │   ├── apiService.ts   # Cliente HTTP base
│   │   ├── authService.ts  # Servicios de autenticación
│   │   └── inventoryService.ts # Servicios de inventario
│   ├── hooks/              # Hooks personalizados
│   │   ├── useAuth.ts      # Hook de autenticación
│   │   ├── useFetch.ts     # Hook para llamadas API
│   │   └── useLocalStorage.ts # Hook para localStorage
│   ├── context/            # Contextos globales
│   │   ├── AuthContext.tsx # Contexto de autenticación
│   │   └── ThemeContext.tsx # Contexto de tema
│   ├── types/              # Tipos TypeScript
│   │   ├── auth.ts         # Tipos de autenticación
│   │   ├── inventory.ts    # Tipos de inventario
│   │   ├── common.ts       # Tipos comunes
│   │   └── index.ts        # Exportaciones
│   ├── utils/              # Funciones utilitarias
│   │   ├── dateUtils.ts    # Formateo de fechas
│   │   ├── numberUtils.ts  # Formateo de números/moneda
│   │   ├── stringUtils.ts  # Utilidades de strings
│   │   └── index.ts        # Exportaciones
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos base + Tailwind
├── public/                 # Archivos estáticos
├── package.json           # Dependencias y scripts
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── vite.config.ts         # Configuración de Vite
```

### 🎯 Funcionalidades del Frontend

#### 1. **Sistema de Autenticación**
- Formulario de login con validación
- Gestión de tokens JWT en localStorage
- Protección de rutas privadas
- Manejo de roles y permisos
- Logout automático en caso de token expirado

#### 2. **Dashboard Principal**
- Métricas en tiempo real (ventas del día, stock bajo)
- Gráficos de ventas
- Accesos rápidos a funciones principales
- Resumen de actividad reciente

#### 3. **Gestión de Productos**
- Lista paginada con búsqueda y filtros
- Formulario de creación/edición
- Gestión de categorías
- Control de stock en tiempo real
- Alertas de stock bajo

#### 4. **Gestión de Clientes**
- Lista paginada con búsqueda
- Formulario de registro de clientes
- Historial de compras por cliente
- Datos de contacto y dirección

#### 5. **Sistema de Ventas**
- **Punto de Venta (POS):**
  - Buscador de productos
  - Carrito de compras
  - Cálculo automático de totales
  - Selección de cliente
  - Métodos de pago
  - Generación de ticket/factura

#### 6. **Reportes y Estadísticas**
- Ventas por período
- Productos más vendidos
- Clientes frecuentes
- Análisis de rentabilidad
- Exportación a Excel/PDF

### 🎨 Diseño y UX

**Tecnologías de UI:**
- **Tailwind CSS 3.4.0**: Framework de CSS utility-first
- **Heroicons**: Iconografía consistente
- **Lucide React**: Iconos adicionales
- **Diseño Responsive**: Adaptable a móviles y tablets

**Características del Diseño:**
- Sidebar de navegación colapsible
- Tema claro/oscuro (opcional)
- Componentes reutilizables
- Formularios con validación en tiempo real
- Tablas con paginación y ordenamiento
- Modales para acciones críticas

### ⚙️ Configuración del Frontend

**Dependencias Principales:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "tailwindcss": "3.4.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0",
  "@heroicons/react": "^2.0.0",
  "lucide-react": "^0.400.0",
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0"
}
```

**Scripts Disponibles:**
```bash
npm run dev     # Servidor de desarrollo
npm run build   # Construir para producción
npm run preview # Vista previa de producción
npm run lint    # Ejecutar ESLint
```

---

## 🚀 Instalación y Ejecución Completa

### 1. **Preparar el Entorno**
```bash
# Clonar o navegar al proyecto
cd "D:\TUKI\Ventas"

# Verificar estructura
ls
# Deberías ver: backend/ frontend/
```

### 2. **Configurar Backend**
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Inicializar datos de prueba
npm run init-data

# Ejecutar servidor (Puerto 3000)
npm run dev
```

### 3. **Configurar Frontend**
```bash
cd ../frontend

# Instalar dependencias
npm install

# Ejecutar aplicación (Puerto 5173)
npm run dev
```

### 4. **Acceder al Sistema**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Login**: admin@tuki.com / admin123

---

## 🔧 Estado Actual del Desarrollo

### ✅ **Backend - COMPLETADO (100%)**
- [x] Configuración de Express y MySQL
- [x] Modelos de Sequelize con relaciones
- [x] Sistema de autenticación JWT
- [x] CRUD completo para todas las entidades
- [x] Middleware de autorización por roles
- [x] Validación de datos con express-validator
- [x] Manejo de errores centralizado
- [x] Sistema de reportes básicos
- [x] Script de inicialización con datos de prueba
- [x] Documentación completa

### 🔄 **Frontend - EN DESARROLLO (70%)**
- [x] Configuración de Vite + React + TypeScript
- [x] Configuración de Tailwind CSS
- [x] Estructura de carpetas y tipos TypeScript
- [x] Servicios de API con Axios
- [x] Context de autenticación
- [x] Hooks personalizados básicos
- [x] Componentes base (Button, Input)
- [x] Layouts (Auth, Dashboard)
- [x] Página de Login
- [x] Página de Dashboard básica
- [ ] **PENDIENTE**: Páginas completas de gestión
- [ ] **PENDIENTE**: Componentes de tablas avanzadas
- [ ] **PENDIENTE**: Sistema de POS completo
- [ ] **PENDIENTE**: Reportes con gráficos
- [ ] **PENDIENTE**: Responsive design final
- [ ] **PENDIENTE**: Testing

---

## 🎯 Próximos Pasos para Completar el Frontend

### 1. **Completar Páginas Principales**
- Gestión de Productos (lista, crear, editar)
- Gestión de Clientes (lista, crear, editar)
- Gestión de Categorías
- Sistema de Ventas/POS
- Página de Reportes

### 2. **Componentes Avanzados**
- Tablas con paginación y filtros
- Formularios complejos con validación
- Modales de confirmación
- Sistema de notificaciones
- Buscador avanzado

### 3. **Características Adicionales**
- Exportación de reportes (PDF/Excel)
- Impresión de tickets
- Dashboard con gráficos (Chart.js/Recharts)
- Sistema de notificaciones push
- Modo offline básico

---

## 📋 Comandos Útiles para Desarrollo

### Backend
```bash
# Reiniciar datos de prueba
npm run init-data

# Ver logs en tiempo real
npm run dev

# Verificar conexión a base de datos
node -e "require('./config/db.config').connectDB()"
```

### Frontend
```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Verificar build
npm run preview

# Linting
npm run lint --fix
```

### Base de Datos
```sql
-- Conectar a MySQL
mysql -u root -p

-- Verificar datos
USE inventory_sales;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM sales;
```

---

## 🔍 Testing y Debugging

### Endpoints de Prueba
```bash
# Test de conexión
curl http://localhost:3000/

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin@tuki.com","password":"admin123"}'

# Listar productos (requiere token)
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Herramientas Recomendadas
- **Postman**: Para testing de API
- **MySQL Workbench**: Para gestión de base de datos
- **React Developer Tools**: Para debugging del frontend
- **Redux DevTools**: Si se implementa Redux

---

## 📞 Soporte y Documentación

### Archivos de Referencia
- `INSTALLATION_GUIDE.md` - Guía detallada de instalación
- `API_DOCUMENTATION.md` - Documentación completa de la API
- `.env.example` - Variables de entorno requeridas
- `package.json` - Dependencias y scripts disponibles

### Contacto y Recursos
- Repositorio del proyecto: [Tu repositorio]
- Documentación técnica: Este archivo
- Issues conocidos: Ver GitHub Issues
- Actualizaciones: Check CHANGELOG.md

---

**💡 Nota**: Este documento debe mantenerse actualizado conforme evolucione el proyecto. Es la referencia principal para cualquier desarrollador que trabaje en el sistema de inventario y ventas.

---

*Última actualización: 12 de Agosto de 2025*
*Versión del sistema: 1.0.0*
*Estado: Backend completo, Frontend en desarrollo*
