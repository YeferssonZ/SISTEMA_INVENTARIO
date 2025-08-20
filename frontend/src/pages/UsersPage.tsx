import React, { useState } from 'react';
import { Button, LoadingSpinner, ConfirmDialog, UserForm } from '../components';
import { useUsers } from '../hooks';
import type { User } from '../types';
import type { UserFormData } from '../components/UserForm';

export const UsersPage: React.FC = () => {
  const { 
    users, 
    isLoading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser,
    refetchUsers
  } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  const handleFormSubmit = async (userData: UserFormData) => {
    try {
      setIsSubmitting(true);
      
      if (editingUser) {
        // Para actualizar, removemos el password si está vacío
        const updateData = { ...userData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(editingUser.id, updateData);
      } else {
        // Para crear, aseguramos que password existe
        if (!userData.password) {
          throw new Error('La contraseña es requerida');
        }
        await createUser({
          ...userData,
          password: userData.password
        });
      }
      
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    
    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'employee': return 'Empleado';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-600 text-white';
      case 'manager': return 'bg-blue-600 text-white';
      case 'employee': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-gray-300">Administra los usuarios del sistema</p>
            </div>
            <Button 
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Nuevo Usuario
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Filtros</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Nombre, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="employee">Empleado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={refetchUsers}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white border border-gray-600"
                >
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Lista de Usuarios ({filteredUsers.length})</h3>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">👤</div>
              <p className="text-gray-400 text-lg">
                {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios con los filtros aplicados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Usuario</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-white font-medium">{user.username}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-300">{user.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-300">
                          {user.firstName} {user.lastName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{users.length}</div>
              <div className="text-gray-300 text-sm">Total usuarios</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-gray-300 text-sm">Activos</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-gray-300 text-sm">Administradores</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {users.filter(u => u.role === 'manager').length}
              </div>
              <div className="text-gray-300 text-sm">Gerentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de usuario */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={editingUser}
        isLoading={isSubmitting}
        darkMode={true}
      />

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${deletingUser?.username}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        darkMode={true}
      />
    </div>
  );
};
