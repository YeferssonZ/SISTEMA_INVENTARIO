# 🏪 Sistema de Ventas e Inventario

Un sistema completo de gestión de ventas e inventario desarrollado con tecnologías modernas, diseñado para pequeñas y medianas empresas que necesitan controlar sus productos, clientes y ventas de manera eficiente.

## 🌟 Características Principales

- **Gestión de Inventario**: Control completo de productos, categorías y stock
- **Punto de Venta (POS)**: Sistema intuitivo para realizar ventas con carrito de compras
- **Gestión de Clientes**: Registro y seguimiento de clientes con historial de compras
- **Gestión de Usuarios**: Sistema de roles (Admin, Manager, Empleado) con permisos diferenciados
- **Reportes y Estadísticas**: Dashboard con métricas en tiempo real
- **Cálculo de Impuestos**: Sistema integrado de IGV (18%) para el mercado peruano
- **Interfaz Oscura**: Diseño moderno y profesional con tema dark
- **Gestión de Ventas**: Historial completo con capacidad de cancelación y restauración de stock

## 🏗️ Arquitectura del Sistema

### Backend - API RESTful

**Tecnologías utilizadas:**
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Sequelize ORM** - Mapeo objeto-relacional
- **MySQL** - Base de datos principal
- **JWT** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **express-validator** - Validación de datos

**Estructura del Backend:**
```
backend/
├── config/          # Configuración de base de datos
├── controllers/     # Lógica de negocio
├── middleware/      # Middlewares de autenticación y validación
├── models/          # Modelos de Sequelize
├── routes/          # Definición de rutas API
├── scripts/         # Scripts de inicialización
└── server.js        # Punto de entrada del servidor
```

**Características del Backend:**
- **API REST** con endpoints para todas las operaciones CRUD
- **Autenticación JWT** con middleware de protección
- **Transacciones de base de datos** para operaciones críticas
- **Validación de datos** robusta con express-validator
- **Manejo de errores** centralizado
- **Relaciones complejas** entre entidades (Usuario, Producto, Venta, etc.)
- **Cálculos automáticos** de totales, impuestos y stock
- **Sistema de auditoría** para ventas canceladas

**Endpoints principales:**
- `/api/auth/*` - Autenticación y gestión de usuarios
- `/api/products/*` - Gestión de productos
- `/api/categories/*` - Gestión de categorías
- `/api/customers/*` - Gestión de clientes
- `/api/sales/*` - Gestión de ventas
- `/api/reports/*` - Reportes y estadísticas

### Frontend - Interfaz de Usuario

**Tecnologías utilizadas:**
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Vite** - Herramienta de construcción
- **Axios** - Cliente HTTP
- **React Router** - Navegación
- **Context API** - Gestión de estado global

**Estructura del Frontend:**
```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── context/         # Contextos de React (Auth, etc.)
│   ├── hooks/           # Hooks personalizados
│   ├── layouts/         # Layouts de páginas
│   ├── pages/           # Páginas principales
│   ├── services/        # Servicios de API
│   ├── types/           # Definiciones de TypeScript
│   └── utils/           # Utilidades y helpers
└── public/              # Archivos estáticos
```

**Características del Frontend:**
- **Interfaz moderna** con diseño dark y responsive
- **Componentes reutilizables** con TypeScript
- **Gestión de estado** con Context API y hooks personalizados
- **Validación en tiempo real** de formularios
- **Manejo de errores** user-friendly
- **Sistema de navegación** protegido por roles
- **Interfaz POS** intuitiva con carrito de compras
- **Filtros avanzados** para todas las listas
- **Modales y diálogos** de confirmación
- **Indicadores visuales** para estados (activo/inactivo, completado/cancelado)

**Páginas principales:**
- **Dashboard** - Resumen ejecutivo con estadísticas
- **Productos** - Gestión completa del inventario
- **Categorías** - Organización de productos
- **Clientes** - Base de datos de clientes
- **Ventas** - Punto de venta y historial de transacciones
- **Login** - Autenticación de usuarios

## 💡 Funcionalidades Destacadas

### Sistema de Punto de Venta (POS)
- Carrito de compras interactivo
- Selección de clientes opcional
- Cálculo automático de IGV (18%)
- Aplicación de descuentos
- Validación de stock en tiempo real
- Generación de recibos

### Gestión de Inventario
- Control de stock automático
- Productos activos/inactivos
- Categorización de productos
- Alertas de stock bajo
- Actualización automática tras ventas/cancelaciones

### Sistema de Ventas
- Historial completo de transacciones
- Cancelación de ventas con restauración de stock
- Filtros por estado (completadas/canceladas)
- Detalles completos por venta
- Estadísticas de vendedor

### Dashboard Ejecutivo
- Métricas en tiempo real
- Productos con stock bajo
- Estadísticas de ventas
- Accesos rápidos a funcionalidades

### Control de Acceso
- **Admin**: Acceso completo al sistema
- **Manager**: Gestión de ventas, productos y reportes
- **Empleado**: Principalmente ventas y consultas

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- MySQL (v8 o superior)
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd Ventas
```

### 2. Configuración del Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Configurar las variables de entorno en .env:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ventas_db
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
JWT_SECRET=tu_jwt_secret_key
PORT=3000
```

### 3. Configuración de la Base de Datos

```bash
# Crear la base de datos en MySQL
mysql -u tu_usuario -p -e "CREATE DATABASE ventas_db;"

# Sincronizar tablas y poblar datos iniciales
npm run init-db

# O ejecutar manualmente:
node scripts/init-data.js
```

### 4. Configuración del Frontend

```bash
# Navegar a la carpeta frontend (en otra terminal)
cd frontend

# Instalar dependencias
npm install
```

### 5. Ejecutar el Sistema

**Terminal 1 - Backend:**
```bash
cd backend
node scripts/init-data.js
npm start
```
El backend estará disponible en: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: `http://localhost:5173`

### 6. Acceso al Sistema

Una vez iniciado, puedes acceder con las siguientes credenciales de prueba:

- **Administrador**: 
  - Email: `admin@tuki.com`
  - Password: `admin123`

- **Manager**: 
  - Email: `manager@tuki.com`  
  - Password: `manager123`

- **Empleado**: 
  - Email: `empleado@tuki.com`
  - Password: `empleado123`

## 📊 Estructura de Base de Datos

El sistema maneja las siguientes entidades principales:

- **Users** - Usuarios del sistema con roles
- **Categories** - Categorías de productos
- **Products** - Inventario de productos
- **Customers** - Base de datos de clientes
- **Sales** - Encabezados de ventas
- **SaleDetails** - Detalles de productos por venta

## 🔧 Scripts Disponibles

### Backend
```bash
npm start          # Iniciar servidor en modo producción
npm run dev        # Iniciar servidor en modo desarrollo
npm run init-db    # Inicializar base de datos con datos de prueba
```

### Frontend
```bash
npm run dev        # Iniciar en modo desarrollo
npm run build      # Construir para producción
npm run preview    # Previsualizar construcción de producción
npm run lint       # Ejecutar linting
```

## 📝 Notas Importantes

- El sistema está configurado para el mercado peruano con cálculo de IGV (18%)
- Las ventas canceladas conservan el historial para auditoría
- El stock se actualiza automáticamente con cada venta y cancelación
- Los productos inactivos no se pueden vender pero se mantienen en el historial
- El sistema utiliza transacciones de base de datos para garantizar la integridad

## 🛠️ Tecnologías y Herramientas

**Backend:**
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- bcryptjs, express-validator

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Axios
- React Router

**Herramientas de Desarrollo:**
- ESLint
- Prettier
- PostCSS
- Vite

---

*Desarrollado con ❤️ para facilitar la gestión de pequeños y medianos negocios*
