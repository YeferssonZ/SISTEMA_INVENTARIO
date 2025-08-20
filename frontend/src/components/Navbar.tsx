import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { Button } from './Button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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

  const navigationItems = [
    {
      name: 'Productos',
      path: '/products',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    },
    {
      name: 'Categorías',
      path: '/categories',
      icon: 'M19 11H5m14-4l2 2-2 2M5 11H3l2-2-2-2'
    },
    {
      name: 'Clientes',
      path: '/customers',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
    },
    {
      name: 'Ventas',
      path: '/sales',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
    },
    ...(user?.role === 'admin' ? [{
      name: 'Usuarios',
      path: '/users',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M8 4a4 4 0 118 0 4 4 0 01-8 0zm8 6a3 3 0 11-6 0 3 3 0 016 0z'
    }] : [])
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-2xl border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => navigate('/dashboard')}
            >
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
                <span className="text-white font-bold text-lg lg:text-xl">T</span>
              </div>
              <div className="ml-3">
                <span className="text-xl lg:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  TUKI Ventas
                </span>
                <div className="text-xs text-gray-400 hidden lg:block">
                  Sistema de Gestión
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* User Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${getRoleColor(user?.role || '')}`}>
                  {user?.role?.toUpperCase()}
                </span>
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              size="sm"
              variant="secondary"
              darkMode={true}
              onClick={logout}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Salir</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* User Info Mobile */}
            <div className="mb-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-gray-400">{user?.email}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg mt-1 ${getRoleColor(user?.role || '')}`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.name}</span>
              </button>
            ))}

            {/* Logout Button Mobile */}
            <div className="pt-4 border-t border-gray-700">
              <Button 
                size="sm"
                variant="secondary"
                darkMode={true}
                onClick={logout}
                className="flex items-center space-x-2 w-full px-4 py-3 border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navbar };
