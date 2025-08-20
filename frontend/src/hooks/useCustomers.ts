import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services';
import type { Customer, SearchFilters } from '../types';

interface CustomerSearchFilters extends SearchFilters {
  isActive?: boolean;
}

export const useCustomers = (filters?: CustomerSearchFilters) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/customers', { params: filters });
      setCustomers(response.data.data.customers || []); // Cambio aquí: data.customers
      setPagination(response.data.data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
      setCustomers([]); // Asegurar que siempre tengamos un array
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const createCustomer = async (customerData: any) => {
    try {
      setError(null);
      const response = await apiService.post('/customers', customerData);
      const newCustomer = response.data.data; // Cambio aquí
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear cliente';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateCustomer = async (id: number, customerData: any) => {
    try {
      setError(null);
      const response = await apiService.put(`/customers/${id}`, customerData);
      const updatedCustomer = response.data.data; // Cambio aquí
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? updatedCustomer : customer
      ));
      return updatedCustomer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar cliente';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      setError(null);
      await apiService.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar cliente';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getCustomerStats = async (id: number) => {
    try {
      const response = await apiService.get(`/customers/${id}/stats`);
      return response.data.stats;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al obtener estadísticas del cliente');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [JSON.stringify(filters)]);

  return {
    customers,
    pagination,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats
  };
};
