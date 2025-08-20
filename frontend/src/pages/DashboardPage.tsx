import React from 'react';
import { useAuth } from '../context';
import { Button, LoadingSpinner } from '../components';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks';
import { formatCurrency } from '../utils';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span>Error al cargar datos del dashboard: {error}</span>
              <Button onClick={refetch} variant="secondary" darkMode={true}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'manager':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-green-600 text-white';
    }
  };

  const getStockStatusColor = (count: number) => {
    if (count === 0) return 'text-green-400';
    if (count <= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-8 lg:py-12 space-y-6 lg:space-y-0">
            {/* Title and Welcome Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    Dashboard - Sistema de Ventas
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-2">
                    <p className="text-gray-300 text-base lg:text-lg">
                      Bienvenido, <span className="font-semibold text-white">{user?.firstName} {user?.lastName}</span>
                    </p>
                    <div className="hidden sm:block text-gray-500">•</div>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mt-2 sm:mt-0 w-fit ${getRoleColor(user?.role || '')}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats Bar - Mobile */}
              <div className="flex lg:hidden flex-wrap gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Productos</div>
                  <div className="text-xl font-bold text-blue-400">{stats?.totalProducts || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Ventas Hoy</div>
                  <div className="text-xl font-bold text-green-400">{formatCurrency(stats?.todaySales?.total || 0, 'PEN')}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Clientes</div>
                  <div className="text-xl font-bold text-purple-400">{stats?.totalCustomers || 0}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 min-w-fit">
              <Button
                onClick={refetch}
                variant="secondary"
                darkMode={true}
                className="flex items-center space-x-2 px-6 py-3 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </Button>
              
              <Button
                onClick={() => navigate('/sales')}
                variant="primary"
                darkMode={true}
                className="flex items-center space-x-2 px-6 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nueva Venta</span>
              </Button>

              {/* Alert Badge for Low Stock */}
              {stats?.lowStockProducts && stats.lowStockProducts > 0 && (
                <div className="relative">
                  <Button
                    onClick={() => navigate('/products?filter=lowStock')}
                    variant="secondary"
                    darkMode={true}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 14.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Stock Bajo</span>
                  </Button>
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {stats.lowStockProducts}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Info Bar - Desktop Only */}
          <div className="hidden lg:flex items-center justify-between pb-6 pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Sistema Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Última actualización: {new Date().toLocaleTimeString('es-PE')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{user?.email}</span>
              </div>
            </div>
            
            {/* Quick Navigation Links */}
            <div className="flex items-center space-x-1">
              {[
                { name: 'Productos', path: '/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                { name: 'Clientes', path: '/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
                { name: 'Categorías', path: '/categories', icon: 'M19 11H5m14-4l2 2-2 2M5 11H3l2-2-2-2' }
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {stats?.totalProducts || 0}
                </div>
                <p className="text-gray-300">Total Productos</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(stats?.todaySales?.total || 0, 'PEN')}
                </div>
                <p className="text-gray-300">Ventas Hoy</p>
                <p className="text-xs text-gray-400">{stats?.todaySales?.count || 0} transacciones</p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {stats?.totalCustomers || 0}
                </div>
                <p className="text-gray-300">Clientes</p>
              </div>
              <div className="p-3 bg-purple-600 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getStockStatusColor(stats?.lowStockProducts || 0)}`}>
                  {stats?.lowStockProducts || 0}
                </div>
                <p className="text-gray-300">Stock Bajo</p>
                <p className="text-xs text-gray-400">Productos por reponer</p>
              </div>
              <div className="p-3 bg-red-600 rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 14.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Sales */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Ventas del Mes</h3>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-400">
                {formatCurrency(stats?.monthSales?.total || 0, 'PEN')}
              </div>
              <div className="text-gray-300">
                {stats?.monthSales?.count || 0} ventas realizadas este mes
              </div>
              
              {/* Simple chart representation */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Historial (últimos 6 meses)</h4>
                {stats?.salesByMonth && stats.salesByMonth.length > 0 ? (
                  <div className="space-y-2">
                    {stats.salesByMonth.slice(-6).map((monthData) => (
                      <div key={monthData.month} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{monthData.month}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{monthData.salesCount} ventas</span>
                          <span className="text-sm font-medium text-green-400">
                            {formatCurrency(Number(monthData.totalRevenue), 'PEN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No hay datos disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Mi Perfil</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400">Usuario</label>
                <p className="text-white">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <p className="text-white text-sm">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Rol</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {user?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Productos Más Vendidos (Este Mes)</h3>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{product['product.name']}</p>
                        <p className="text-xs text-gray-400">SKU: {product['product.sku']}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{product.totalQuantity} unidades</p>
                      <p className="text-green-400 text-sm">{formatCurrency(Number(product.totalRevenue), 'PEN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No hay datos de ventas disponibles</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/sales')}
                variant="primary"
                darkMode={true}
              >
                Nueva Venta
              </Button>
              <Button 
                className="w-full" 
                onClick={() => navigate('/products')}
                variant="secondary"
                darkMode={true}
              >
                Ver Productos
              </Button>
              <Button 
                className="w-full" 
                onClick={() => navigate('/customers')}
                variant="secondary"
                darkMode={true}
              >
                Ver Clientes
              </Button>
              <Button 
                className="w-full" 
                onClick={() => navigate('/categories')}
                variant="secondary"
                darkMode={true}
              >
                Ver Categorías
              </Button>
            </div>
            
            {/* Stock alerts - Solo se muestra si hay productos con stock bajo */}
            {(stats?.lowStockProducts && stats.lowStockProducts > 0) ? (
              <div className="mt-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 14.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-400 font-medium">Alerta de Stock</span>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  {stats.lowStockProducts} productos necesitan reposición
                </p>
                <Button 
                  className="w-full mt-2" 
                  onClick={() => navigate('/products?filter=lowStock')}
                  variant="primary"
                  darkMode={true}
                  size="sm"
                >
                  Ver Productos
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardPage };
