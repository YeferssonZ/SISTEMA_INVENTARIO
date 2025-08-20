import { useState, useEffect } from 'react';
import { apiService } from '../services';
import type { User } from '../types';

interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const useUsers = (filters?: UserFilters) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/users', { params: filters });
      setUsers(response.data.data.users || []);
      setPagination(response.data.data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = async (id: number): Promise<User> => {
    try {
      setError(null);
      const response = await apiService.get(`/users/${id}`);
      return response.data.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al obtener usuario';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const createUser = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'manager' | 'employee';
    isActive?: boolean;
  }): Promise<User> => {
    try {
      setError(null);
      const response = await apiService.post('/users', userData);
      await fetchUsers(); // Refrescar lista
      return response.data.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      setError(null);
      const response = await apiService.put(`/users/${id}`, userData);
      await fetchUsers(); // Refrescar lista
      return response.data.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteUser = async (id: number): Promise<void> => {
    try {
      setError(null);
      await apiService.delete(`/users/${id}`);
      await fetchUsers(); // Refrescar lista
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const changeUserPassword = async (id: number, newPassword: string): Promise<void> => {
    try {
      setError(null);
      await apiService.put(`/users/${id}/change-password`, { newPassword });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cambiar contraseña';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (filters) {
      fetchUsers();
    }
  }, [filters]);

  return {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    refetchUsers: fetchUsers
  };
};
