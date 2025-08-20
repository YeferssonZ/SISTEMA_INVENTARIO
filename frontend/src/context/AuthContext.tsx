import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar token válido al cargar la aplicación
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        try {
          // Verificar si el token es válido obteniendo el perfil del usuario
          const userProfile = await authService.getProfile();
          setUser(userProfile);
          setToken(savedToken);
        } catch (error) {
          console.error('Token inválido:', error);
          // Token inválido, limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (loginField: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ login: loginField, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error: any) {
      // Mejorar los mensajes de error según el tipo de error
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email/usuario y contraseña.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado. Verifica tu email/usuario.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Cuenta desactivada. Contacta al administrador.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authService.logout();
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
