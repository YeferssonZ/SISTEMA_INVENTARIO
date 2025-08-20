import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '.';
import type { User } from '../types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
  user?: User | null;
  isLoading?: boolean;
  darkMode?: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user, 
  isLoading = false,
  darkMode = true
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'employee',
        isActive: user.isActive !== false
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        isActive: true
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuario' : 'Nuevo Usuario'} darkMode={darkMode}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de usuario *"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            error={errors.username}
            disabled={isLoading}
            placeholder="Ingresa el nombre de usuario"
            darkMode={darkMode}
          />

          <Input
            type="email"
            label="Email *"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            disabled={isLoading}
            placeholder="usuario@ejemplo.com"
            darkMode={darkMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            disabled={isLoading}
            placeholder="Nombre del usuario"
            darkMode={darkMode}
          />

          <Input
            label="Apellido *"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            disabled={isLoading}
            placeholder="Apellido del usuario"
            darkMode={darkMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Rol *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-600 text-gray-100' 
                  : 'bg-white border border-gray-300 text-gray-900'
              }`}
            >
              <option value="employee">Empleado</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && <p className={`text-sm mt-1 ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>{errors.role}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Estado
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
              disabled={isLoading}
              className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-600 text-gray-100' 
                  : 'bg-white border border-gray-300 text-gray-900'
              }`}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        {(!user || showPassword) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {user ? 'Nueva contraseña' : 'Contraseña *'}
              </label>
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    setFormData(prev => ({ ...prev, password: '' }));
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`text-sm hover:opacity-80 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {showPassword ? 'Cancelar' : 'Cambiar contraseña'}
                </button>
              )}
            </div>
            <Input
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              disabled={isLoading}
              placeholder={user ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
              darkMode={darkMode}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : user ? 'Actualizar' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
