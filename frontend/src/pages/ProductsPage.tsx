import React, { useState } from 'react';
import { Button, LoadingSpinner, Modal, ProductForm, ConfirmDialog } from '../components';
import { useAuth } from '../context';
import { useProducts, useCategories } from '../hooks';
import type { Product, SearchFilters } from '../types';
import { formatCurrency } from '../utils';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'ASC',
    isActive: true // Por defecto solo mostrar productos activos
  });

  const { products, pagination, isLoading, error, createProduct, updateProduct, deleteProduct } = useProducts(filters);
  const { categories } = useCategories();

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setFilters(prev => ({ ...prev, categoryId, page: 1 }));
  };

  const handleStockFilter = (lowStock: boolean) => {
    setFilters(prev => ({ ...prev, lowStock, page: 1 }));
  };

  const handleActiveFilter = (isActive: boolean | undefined) => {
    setFilters(prev => ({ ...prev, isActive, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateProduct = () => {
    setEditingProduct(undefined);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const handleProductSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }
      setShowProductModal(false);
      setEditingProduct(undefined);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      setIsSubmitting(true);
      await deleteProduct(deletingProduct.id);
      setShowDeleteDialog(false);
      setDeletingProduct(undefined);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivateProduct = async (product: Product) => {
    try {
      setIsSubmitting(true);
      await updateProduct(product.id, { ...product, isActive: true });
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatusColor = (product: Product) => {
    if (product.stock <= 0) return 'text-red-600 bg-red-50';
    if (product.stock <= product.minStock) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (product: Product) => {
    if (product.stock <= 0) return 'Sin stock';
    if (product.stock <= product.minStock) return 'Stock bajo';
    return 'En stock';
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
              <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
              <p className="text-gray-300">Administra tu inventario de productos</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Button 
                onClick={handleCreateProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Agregar Producto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-4">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Filtros</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Buscar</label>
                <input
                  type="text"
                  placeholder="Nombre, SKU, código de barras..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filters.categoryId || ''}
                  onChange={(e) => handleCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estado de Stock</label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filters.lowStock ? 'low' : 'all'}
                  onChange={(e) => handleStockFilter(e.target.value === 'low')}
                >
                  <option value="all">Todos</option>
                  <option value="low">Stock bajo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estado del Producto</label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filters.isActive === undefined ? 'all' : (filters.isActive ? 'active' : 'inactive')}
                  onChange={(e) => handleActiveFilter(
                    e.target.value === 'all' ? undefined : e.target.value === 'active'
                  )}
                >
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo eliminados</option>
                  <option value="all">Todos</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ 
                    page: 1, 
                    limit: 10, 
                    sortBy: 'name', 
                    sortOrder: 'ASC',
                    isActive: true
                  })}
                  className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors text-sm"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">
              {filters.isActive === false ? 'Productos Eliminados' : 
               filters.isActive === undefined ? 'Todos los Productos' : 
               'Productos Activos'} ({pagination?.totalItems || 0})
            </h3>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No se encontraron productos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {products.map((product: Product) => (
                    <tr key={product.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-2">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-400">
                              {product.description.length > 30 
                                ? `${product.description.substring(0, 30)}...` 
                                : product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {product.sku}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-green-400">
                        {formatCurrency(product.price, 'PEN')}
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-300">
                          {product.stock} {product.unit || 'unidades'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mín: {product.minStock}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product)}`}>
                            {getStockStatusText(product)}
                          </span>
                          {!product.isActive && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-600 text-gray-300">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-1">
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <>
                              {product.isActive ? (
                                <>
                                  <button 
                                    onClick={() => handleEditProduct(product)}
                                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(product)}
                                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                  >
                                    Eliminar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleReactivateProduct(product)}
                                    disabled={isSubmitting}
                                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                                  >
                                    {isSubmitting ? 'Reactivando...' : 'Reactivar'}
                                  </button>
                                  <button 
                                    onClick={() => handleEditProduct(product)}
                                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                  >
                                    Ver/Editar
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-t border-gray-600">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="secondary"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    darkMode={true}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    darkMode={true}
                  >
                    Siguiente
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-300">
                      Mostrando{' '}
                      <span className="font-medium text-white">
                        {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                      </span>{' '}
                      a{' '}
                      <span className="font-medium text-white">
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium text-white">{pagination.totalItems}</span>{' '}
                      productos
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                            page === pagination.currentPage
                              ? 'z-10 bg-blue-600 border-blue-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
              Página {pagination.currentPage} de {pagination.totalPages} 
              ({pagination.totalItems} productos en total)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Anterior
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(undefined);
        }}
        title={editingProduct ? 'Editar Producto' : 'Crear Producto'}
        size="lg"
        darkMode={true}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductSubmit}
          onCancel={() => {
            setShowProductModal(false);
            setEditingProduct(undefined);
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
          setDeletingProduct(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Desactivar Producto"
        message={`¿Estás seguro de que deseas desactivar el producto "${deletingProduct?.name}"? El producto se ocultará de la lista pero mantendrá su historial. Podrás reactivarlo posteriormente.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="warning"
        isLoading={isSubmitting}
        darkMode={true}
      />
    </div>
  );
};

export { ProductsPage };
