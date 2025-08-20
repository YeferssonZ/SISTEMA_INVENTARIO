import { useState, useEffect } from 'react';
import { inventoryService } from '../services';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async (isActive?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryService.getCategories({ isActive });
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newCategory = await inventoryService.createCategory(categoryData);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear categoría';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Category>) => {
    try {
      setError(null);
      const updatedCategory = await inventoryService.updateCategory(id, categoryData);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar categoría';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteCategory = async (id: number, force: boolean = false) => {
    try {
      setError(null);
      await inventoryService.deleteCategory(id, force);
      // Actualizar el estado local removiendo la categoría eliminada
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      let errorMsg = 'Error al eliminar categoría';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      // Si hay needsConfirmation, lo incluimos en el error para que el componente lo maneje
      const errorData = {
        message: errorMsg,
        needsConfirmation: err.response?.data?.needsConfirmation,
        productsCount: err.response?.data?.productsCount
      };
      throw errorData;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
    fetchWithFilter: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
