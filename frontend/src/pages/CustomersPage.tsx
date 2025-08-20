import React, { useState } from 'react';
import { Button, Input, LoadingSpinner, Modal, CustomerForm, ConfirmDialog } from '../components';
import { useAuth } from '../context';
import { useCustomers } from '../hooks';
import type { Customer } from '../types';
import { formatDate } from '../utils';

interface CustomerSearchFilters {
  search?: string;
  customerType?: 'individual' | 'empresa';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<CustomerSearchFilters>({
    page: 1,
    limit: 10
  });

  const { customers, isLoading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers(filters);

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para filtros
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'empresa'>('all');

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleTypeFilter = (type: string) => {
    const typeValue = type === 'all' ? undefined : type as 'individual' | 'empresa';
    setTypeFilter(type as 'all' | 'individual' | 'empresa');
    setFilters(prev => ({ ...prev, customerType: typeValue, page: 1 }));
  };

  const handleActiveFilter = (status: string) => {
    const isActive = status === 'all' ? undefined : status === 'active';
    setStatusFilter(status as 'all' | 'active' | 'inactive');
    setFilters(prev => ({ ...prev, isActive, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(undefined);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleReactivateCustomer = async (customer: Customer) => {
    try {
      setIsSubmitting(true);
      await updateCustomer(customer.id, { ...customer, isActive: true });
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
      } else {
        await createCustomer(data);
      }
      setShowCustomerModal(false);
      setEditingCustomer(undefined);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    
    try {
      setIsSubmitting(true);
      await deleteCustomer(deletingCustomer.id);
      setShowDeleteDialog(false);
      setDeletingCustomer(undefined);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCustomerTypeText = (type: string) => {
    return type === 'empresa' ? 'Empresa' : 'Individual';
  };

  const getFullName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setFilters({ page: 1, limit: 10 });
  };

  // Filtrar clientes localmente también para consistencia
  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    const matchesSearch = !filters.search || 
      getFullName(customer).toLowerCase().includes(filters.search.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(filters.search.toLowerCase())) ||
      (customer.phone && customer.phone.includes(filters.search)) ||
      (customer.rfc && customer.rfc.toLowerCase().includes(filters.search.toLowerCase())) ||
      (customer.companyName && customer.companyName.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesSearch;
  }) : [];

  // Paginación local
  const startIndex = (filters.page! - 1) * filters.limit!;
  const endIndex = startIndex + filters.limit!;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCustomers.length / filters.limit!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
              <p className="text-gray-300">Administra tu base de clientes</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button onClick={handleCreateCustomer} darkMode={true}>
                + Agregar Cliente
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filtros Compactos */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-lg font-medium text-white">Filtros</h3>
            
            <div className="flex-1 min-w-64">
              <Input
                type="text"
                placeholder="Buscar por nombre, email, teléfono, RFC..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                darkMode={true}
                className="text-sm"
              />
            </div>

            <div>
              <select
                className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={typeFilter}
                onChange={(e) => handleTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="individual">Individual</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <div>
              <select
                className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => handleActiveFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <Button
              variant="secondary"
              onClick={clearFilters}
              darkMode={true}
              size="sm"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Clientes ({filteredCustomers.length})</h3>
          </div>
          
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {paginatedCustomers.map((customer: Customer) => (
                <div key={customer.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium">{getFullName(customer)}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.isActive 
                              ? 'bg-green-600 text-green-100' 
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {customer.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        {customer.companyName && (
                          <p className="text-gray-400 text-sm mt-1">{customer.companyName}</p>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                          customer.customerType === 'empresa' 
                            ? 'bg-blue-600 text-blue-100' 
                            : 'bg-green-600 text-green-100'
                        }`}>
                          {getCustomerTypeText(customer.customerType || 'individual')}
                        </span>
                      </div>

                      <div>
                        <div className="space-y-1">
                          {customer.email && (
                            <p className="text-gray-300 text-sm">
                              <span className="text-gray-500">Email:</span> {customer.email}
                            </p>
                          )}
                          <p className="text-gray-300 text-sm">
                            <span className="text-gray-500">Teléfono:</span> {customer.phone}
                          </p>
                          {customer.rfc && (
                            <p className="text-gray-300 text-sm">
                              <span className="text-gray-500">RFC:</span> {customer.rfc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500">Registro:</span> {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <div className="flex space-x-2 ml-4">
                        {customer.isActive ? (
                          <>
                            <button 
                              onClick={() => handleEditCustomer(customer)}
                              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteCustomer(customer)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleReactivateCustomer(customer)}
                              disabled={isSubmitting}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                            >
                              {isSubmitting ? 'Reactivando...' : 'Reactivar'}
                            </button>
                            <button 
                              onClick={() => handleEditCustomer(customer)}
                              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              Ver/Editar
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCustomers.length)} de {filteredCustomers.length} clientes
            </div>
            <div className="flex space-x-2">
              <button
                disabled={filters.page! <= 1}
                onClick={() => handlePageChange(filters.page! - 1)}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Anterior
              </button>
              <button
                disabled={filters.page! >= totalPages}
                onClick={() => handlePageChange(filters.page! + 1)}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setEditingCustomer(undefined);
        }}
        title={editingCustomer ? 'Editar Cliente' : 'Crear Cliente'}
        size="lg"
        darkMode={true}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleCustomerSubmit}
          onCancel={() => {
            setShowCustomerModal(false);
            setEditingCustomer(undefined);
          }}
          isLoading={isSubmitting}
          darkMode={true}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingCustomer(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${deletingCustomer ? getFullName(deletingCustomer) : ''}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isSubmitting}
        darkMode={true}
      />
    </div>
  );
};

export { CustomersPage };
