import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import type { Category } from '../types';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  darkMode?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  darkMode = true
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          label="Nombre *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
          darkMode={darkMode}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
            darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
          }`}
          disabled={isLoading}
        />
        <label htmlFor="isActive" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Categoría activa
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          darkMode={darkMode}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          darkMode={darkMode}
        >
          {isLoading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
};
