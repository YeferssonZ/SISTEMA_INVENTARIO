import React, { useState } from 'react';
import { useAuth } from '../context';
import { Button, Input } from '../components';

const LoginPage: React.FC = () => {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginField || !password) {
      setError('Por favor ingresa email/usuario y contraseña');
      return;
    }

    try {
      await login(loginField, password);
      // La redirección se maneja automáticamente por el AuthContext
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      
      // Limpiar la contraseña por seguridad en caso de error
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white">
          Sistema de Ventas e Inventario
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Inicia sesión en tu cuenta
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-6 px-4 shadow-lg border border-gray-700 sm:rounded-lg sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <Input
              label="Email o Usuario"
              type="text"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              required
              placeholder="admin@tuki.com o admin"
              darkMode={true}
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="admin123"
              darkMode={true}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Usuarios de prueba</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-300 space-y-1">
              <p><strong className="text-blue-400">Admin:</strong> admin@tuki.com / admin123</p>
              <p><strong className="text-green-400">Manager:</strong> manager@tuki.com / manager123</p>
              <p><strong className="text-yellow-400">Empleado:</strong> empleado@tuki.com / empleado123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
