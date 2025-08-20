import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useCategories } from '../hooks';
import type { Product, Category } from '../types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  darkMode?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isLoading = false,
  darkMode = true
}) => {
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '',
    minStock: product?.minStock?.toString() || '',
    categoryId: product?.categoryId?.toString() || '',
    sku: product?.sku || '',
    isActive: product?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock debe ser un número positivo';
    }

    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      newErrors.minStock = 'El stock mínimo debe ser un número positivo';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'La categoría es requerida';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'El SKU es requerido';
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
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        categoryId: parseInt(formData.categoryId),
        sku: formData.sku.trim(),
        isActive: formData.isActive
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input
            label="SKU *"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            error={errors.sku}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Categoría *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            } ${
              errors.categoryId 
                ? (darkMode ? 'border-red-400' : 'border-red-500')
                : ''
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className={`mt-1 text-sm ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>{errors.categoryId}</p>
          )}
        </div>

        <div>
          <Input
            label="Precio *"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Stock *"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            error={errors.stock}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Stock Mínimo *"
            name="minStock"
            type="number"
            min="0"
            value={formData.minStock}
            onChange={handleChange}
            error={errors.minStock}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>
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
          Producto activo
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
          {isLoading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
};
