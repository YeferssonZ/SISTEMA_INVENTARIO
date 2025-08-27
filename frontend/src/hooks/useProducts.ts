import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services';
import type { Product, SearchFilters } from '../types';

export const useProducts = (filters?: SearchFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await inventoryService.getProducts(filters);
      setProducts(response.products || []);
      setPagination(response.pagination);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMsg);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const createProduct = async (productData: any): Promise<Product> => {
    try {
      setError(null);
      const product = await inventoryService.createProduct(productData);
      await fetchProducts(); // Refrescar la lista completa con filtros
      return product;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear producto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateProduct = async (id: number, productData: any): Promise<Product> => {
    try {
      setError(null);
      const updatedProduct = await inventoryService.updateProduct(id, productData);
      await fetchProducts(); // Refrescar la lista completa con filtros
      return updatedProduct;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    try {
      setError(null);
      await inventoryService.deleteProduct(id);
      await fetchProducts(); // Refrescar la lista completa con filtros
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateStock = async (id: number, stockData: { quantity: number; type: 'add' | 'subtract' | 'set'; reason?: string }): Promise<Product> => {
    try {
      setError(null);
      const updatedProduct = await inventoryService.updateProductStock(id, stockData);
      await fetchProducts(); // Refrescar la lista completa con filtros
      return updatedProduct;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar stock';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
  };
};
