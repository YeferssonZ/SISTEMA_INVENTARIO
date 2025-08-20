import React, { useState } from 'react';
import { Button, LoadingSpinner, Modal, CategoryForm, ConfirmDialog } from '../components';
import { useAuth } from '../context';
import { useCategories } from '../hooks';
import type { Category } from '../types';
import { formatDate } from '../utils';

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const { categories, isLoading, error, createCategory, updateCategory, deleteCategory, fetchWithFilter } = useCategories();
  
  const [filters, setFilters] = useState({
    search: '',
    isActive: undefined as boolean | undefined,
    page: 1,
    limit: 10
  });

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false);
  const [forceDeleteData, setForceDeleteData] = useState<{category: Category, productsCount: number} | null>(null);

  // Filter logic (aplicado tanto en backend como frontend para refinado)
  const filteredCategories = categories.filter(category => {
    // Filtrar por búsqueda
    const matchesSearch = category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(filters.search.toLowerCase()));
    
    // El filtro isActive ya se aplica en el backend, pero lo mantenemos por consistencia
    const matchesStatus = filters.isActive === undefined || category.isActive === filters.isActive;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const startIndex = (filters.page - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCategories.length / filters.limit);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleReactivateCategory = async (category: Category) => {
    try {
      setIsSubmitting(true);
      await updateCategory(category.id, { isActive: true });
      // Refrescar para mostrar el cambio
      await fetchWithFilter(filters.isActive);
    } catch (error: any) {
      alert(error.message || 'Error al reactivar categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const handleCategorySubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setShowCategoryModal(false);
      setEditingCategory(undefined);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (force: boolean = false) => {
    if (!deletingCategory) return;
    
    try {
      setIsSubmitting(true);
      console.log('Eliminando categoría:', deletingCategory.id, 'Force:', force);
      await deleteCategory(deletingCategory.id, force);
      console.log('Categoría eliminada exitosamente');
      setShowDeleteDialog(false);
      setShowForceDeleteDialog(false);
      setDeletingCategory(undefined);
      setForceDeleteData(null);
      // Refrescar la lista para asegurarse de que esté actualizada
      await fetchWithFilter(filters.isActive);
    } catch (error: any) {
      console.error('Error en handleConfirmDelete:', error);
      console.log('Error.needsConfirmation:', error.needsConfirmation);
      console.log('Error.productsCount:', error.productsCount);
      
      if (error.needsConfirmation && !force) {
        // Mostrar dialog de confirmación para forzar eliminación
        setForceDeleteData({
          category: deletingCategory,
          productsCount: error.productsCount
        });
        setShowDeleteDialog(false);
        setShowForceDeleteDialog(true);
      } else {
        // El error ya se maneja en el hook, pero también lo mostramos aquí
        alert(error.message || 'Error al eliminar categoría');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Categorías</h1>
              <p className="text-gray-300">Organiza tu inventario por categorías</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button onClick={handleCreateCategory}>
                + Agregar Categoría
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-4">
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
                  placeholder="Nombre o descripción..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => {
                    const value = e.target.value;
                    const isActive = value === 'all' ? undefined : value === 'active';
                    setFilters(prev => ({ ...prev, isActive, page: 1 }));
                    fetchWithFilter(isActive);
                  }}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ search: '', isActive: undefined, page: 1, limit: 10 });
                    fetchWithFilter(undefined);
                  }}
                  className="w-full px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-600"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Categorías */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Categorías ({filteredCategories.length})</h3>
          </div>
          
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No se encontraron categorías</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCategories.map((category) => (
                  <div key={category.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {category.name}
                      </h3>
                      <div className="flex space-x-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isActive 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {category.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>

                    {category.description && (
                      <p className="text-gray-300 text-sm mb-3">
                        {category.description.length > 80 
                          ? `${category.description.substring(0, 80)}...` 
                          : category.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-400 mb-3">
                      {category.productsCount !== undefined && (
                        <div className="flex justify-between">
                          <span>Productos:</span>
                          <span className="font-medium text-gray-300">{category.productsCount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Creada:</span>
                        <span className="font-medium text-gray-300">{formatDate(category.createdAt)}</span>
                      </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <div className="flex space-x-2 pt-2 border-t border-gray-600">
                        {category.isActive ? (
                          <>
                            <button 
                              onClick={() => handleEditCategory(category)}
                              className="flex-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(category)}
                              className="flex-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleReactivateCategory(category)}
                              disabled={isSubmitting}
                              className="flex-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                            >
                              {isSubmitting ? 'Reactivando...' : 'Reactivar'}
                            </button>
                            <button 
                              onClick={() => handleEditCategory(category)}
                              className="flex-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              Ver/Editar
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCategories.length)} de {filteredCategories.length} categorías
            </div>
            <div className="flex space-x-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Anterior
              </button>
              <button
                disabled={filters.page >= totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(undefined);
        }}
        title={editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
        size="md"
        darkMode={true}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleCategorySubmit}
          onCancel={() => {
            setShowCategoryModal(false);
            setEditingCategory(undefined);
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
          setDeletingCategory(undefined);
        }}
        onConfirm={() => handleConfirmDelete()}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deletingCategory?.name}"? Esta acción desactivará la categoría.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isSubmitting}
        darkMode={true}
      />

      {/* Force Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showForceDeleteDialog}
        onClose={() => {
          setShowForceDeleteDialog(false);
          setForceDeleteData(null);
          setDeletingCategory(undefined);
        }}
        onConfirm={() => handleConfirmDelete(true)}
        title="Eliminar Categoría con Productos"
        message={`La categoría "${forceDeleteData?.category.name}" tiene ${forceDeleteData?.productsCount} producto(s) activo(s) asociado(s). ¿Desea inactivar también los productos para poder eliminar la categoría?`}
        confirmText="Sí, inactivar productos y categoría"
        cancelText="Cancelar"
        variant="warning"
        isLoading={isSubmitting}
        darkMode={true}
      />
    </div>
  );
};

export { CategoriesPage };
