import React, { useState, useEffect } from 'react';
import { useSales, useProducts, useCustomers } from '../hooks';
import { useAuth } from '../context';
import { Button, Input, Modal, LoadingSpinner, ConfirmDialog } from '../components';
import { Product, Customer, Sale } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface SaleSearchFilters {
  search?: string;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'create' | 'list'>('create');
  
  // Filters for sales list
  const [filters, setFilters] = useState<SaleSearchFilters>({
    page: 1,
    limit: 10,
    // Por defecto mostrar solo ventas completadas
    status: 'completada'
  });

  // Estado para controlar si mostrar ventas canceladas
  const [showCancelled, setShowCancelled] = useState(false);

  const {
    // Sales data
    sales,
    pagination,
    isLoading: salesLoading,
    deleteSale,
    refetchSales,
    // Cart functions
    cart,
    selectedCustomer,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setSelectedCustomer,
    createSale,
    getCartTotals
  } = useSales(filters);

  const { products, fetchProducts } = useProducts({ isActive: true });
  const { customers, fetchCustomers } = useCustomers();

  // UI states
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaleDetailsModal, setShowSaleDetailsModal] = useState(false);
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<Sale | null>(null);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleNotes, setSaleNotes] = useState('');
  const [discount, setDiscount] = useState(0);

  const cartTotals = getCartTotals();

  // Efecto para actualizar filtros cuando cambie showCancelled
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      status: showCancelled ? 'cancelada' : 'completada'
    }));
  }, [showCancelled]);

  useEffect(() => {
    if (viewMode === 'create') {
      fetchProducts();
      fetchCustomers();
    }
  }, [viewMode]);

  const filteredProducts = Array.isArray(products) ? products.filter((product: Product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(productSearch.toLowerCase()))
  ) : [];

  const filteredCustomers = Array.isArray(customers) ? customers.filter((customer: Customer) =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(customerSearch.toLowerCase()))
  ) : [];

  // Create sale functions
  const handleAddProduct = (product: Product) => {
    addToCart(product, 1);
    setProductSearch('');
    setShowProductModal(false);
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItemQuantity(productId, quantity);
    }
  };

  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setCustomerSearch('');
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Agregue productos al carrito');
      return;
    }

    try {
      setIsSubmitting(true);
      const saleData = {
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: cartTotals.subtotal,
        tax: cartTotals.tax,
        discount: discount,
        total: cartTotals.total - discount,
        notes: saleNotes
      };

      const newSale = await createSale(saleData);
      setLastSale(newSale);
      clearCart();
      setSelectedCustomer(null);
      setSaleNotes('');
      setDiscount(0);
      setShowReceiptModal(true);
    } catch (error: any) {
      let errorMessage = 'Error al procesar la venta';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!deletingSale) return;

    try {
      setIsSubmitting(true);
      await deleteSale(deletingSale.id);
      setShowDeleteDialog(false);
      setDeletingSale(null);
      // Refrescar los datos para mostrar cambios
      await refetchSales();
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (field: keyof SaleSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (salesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {viewMode === 'create' ? 'Nueva Venta' : 'Gestión de Ventas'}
            </h1>
            <p className="text-gray-400 mt-1">
              {viewMode === 'create' 
                ? 'Crea y procesa nuevas ventas'
                : 'Administra el historial de ventas'
              }
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant={viewMode === 'create' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('create')}
              darkMode={true}
            >
              + Nueva Venta
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
              darkMode={true}
            >
              Ver Ventas
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white">Productos</h3>
                  <div className="mt-3">
                    <Input
                      placeholder="Buscar productos por nombre o código..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      darkMode={true}
                    />
                  </div>
                  <Button
                    onClick={() => setShowProductModal(true)}
                    className="mt-2"
                    variant="secondary"
                    darkMode={true}
                  >
                    Ver Todos los Productos
                  </Button>
                </div>
                
                <div className="p-4">
                  {productSearch && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredProducts.slice(0, 5).map((product: Product) => (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-3 bg-gray-700 rounded-lg transition-colors ${
                            product.stock > 0 
                              ? 'cursor-pointer hover:bg-gray-600' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => product.stock > 0 && handleAddProduct(product)}
                        >
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{product.name}</h4>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`${product.stock <= 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                Stock: {product.stock}
                              </span>
                              <span className="text-gray-400">{formatCurrency(product.price, 'PEN')}</span>
                              {product.barcode && <span className="text-gray-400">Código: {product.barcode}</span>}
                              {product.stock <= 0 && (
                                <span className="text-red-400 font-medium">Sin stock</span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            darkMode={true}
                            disabled={product.stock <= 0}
                          >
                            Agregar
                          </Button>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && productSearch && (
                        <p className="text-gray-400 text-center py-4">
                          No se encontraron productos
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Selection */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-medium text-white">Cliente</h3>
                </div>
                <div className="p-4">
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </h4>
                        <p className="text-gray-400 text-sm">{selectedCustomer.email}</p>
                      </div>
                      <Button
                        onClick={() => setSelectedCustomer(null)}
                        variant="secondary"
                        size="sm"
                        darkMode={true}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowCustomerModal(true)}
                      variant="secondary"
                      darkMode={true}
                    >
                      Seleccionar Cliente (Opcional)
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Carrito ({cart.length})</h3>
              </div>
              
              <div className="p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    El carrito está vacío
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-gray-400 text-xs">
                            {formatCurrency(item.price, 'PEN')} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-white text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-medium">
                            {formatCurrency(item.subtotal, 'PEN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    {/* Discount */}
                    <div className="mb-3">
                      <Input
                        label="Descuento (S/)"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        min="0"
                        darkMode={true}
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notas (Opcional)
                      </label>
                      <textarea
                        value={saleNotes}
                        onChange={(e) => setSaleNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Observaciones de la venta..."
                      />
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Base Imponible:</span>
                        <span>{formatCurrency(cartTotals.subtotal, 'PEN')}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>IGV (18%):</span>
                        <span>{formatCurrency(cartTotals.tax, 'PEN')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Descuento:</span>
                          <span>-{formatCurrency(discount, 'PEN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-600">
                        <span>Total:</span>
                        <span>{formatCurrency(cartTotals.total - discount, 'PEN')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={clearCart}
                        variant="secondary"
                        className="flex-1"
                        darkMode={true}
                      >
                        Limpiar
                      </Button>
                      <Button
                        onClick={handleCompleteSale}
                        variant="primary"
                        className="flex-1"
                        disabled={isSubmitting || cart.length === 0}
                        darkMode={true}
                      >
                        {isSubmitting ? 'Procesando...' : 'Completar Venta'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Sales List View */
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Input
                  placeholder="Buscar ventas..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange('search', e.target.value)}
                  darkMode={true}
                />
                <Input
                  label="Fecha Inicio"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleSearchChange('startDate', e.target.value)}
                  darkMode={true}
                />
                <Input
                  label="Fecha Fin"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleSearchChange('endDate', e.target.value)}
                  darkMode={true}
                />
                <Button
                  onClick={() => {
                    setFilters({ page: 1, limit: 10, status: 'completada' });
                    setShowCancelled(false);
                  }}
                  variant="secondary"
                  darkMode={true}
                >
                  Limpiar Filtros
                </Button>
              </div>
              
              {/* Toggle para mostrar ventas canceladas */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                    className="mr-2 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  {showCancelled ? 'Ver ventas completadas' : 'Ver ventas canceladas'}
                </label>
                {showCancelled ? (
                  <span className="text-sm text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Mostrando ventas canceladas
                  </span>
                ) : (
                  <span className="text-sm text-green-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mostrando ventas completadas
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Ventas ({Array.isArray(sales) ? sales.length : 0})
              </h3>
              
              {Array.isArray(sales) && sales.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No se encontraron ventas</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {Array.isArray(sales) && sales.map((sale: Sale) => (
                    <div key={sale.id} className={`rounded-lg p-4 border ${
                      (sale as any).status === 'cancelada' 
                        ? 'bg-red-900/20 border-red-700' 
                        : 'bg-gray-700 border-gray-600'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">Venta #{sale.id}</div>
                            <div className="text-white font-medium">
                              {formatDate(sale.createdAt)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {sale.customer 
                                ? `${sale.customer.firstName} ${sale.customer.lastName}`
                                : 'Cliente general'
                              }
                            </div>
                            {(sale as any).status === 'cancelada' && (
                              <div className="text-xs text-red-400 mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Venta Cancelada
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-400">Total</div>
                            <div className={`text-lg font-bold ${
                              (sale as any).status === 'cancelada' 
                                ? 'text-red-400 line-through' 
                                : 'text-green-400'
                            }`}>
                              {formatCurrency(sale.total, 'PEN')}
                            </div>
                            <div className="text-xs text-gray-400">
                              Items: {sale.details?.length || 0}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-400">Vendedor</div>
                            <div className="text-white">
                              {sale.creator ? `${sale.creator.firstName} ${sale.creator.lastName}` : 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-400">Estado</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (sale as any).status === 'cancelada'
                                ? 'bg-red-600 text-white'
                                : 'bg-green-600 text-white'
                            }`}>
                              {(sale as any).status === 'cancelada' ? 'Cancelada' : 'Completada'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedSaleForDetails(sale);
                              setShowSaleDetailsModal(true);
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Ver Detalles
                          </button>
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <button
                              onClick={() => {
                                setDeletingSale(sale);
                                setShowDeleteDialog(true);
                              }}
                              disabled={(sale as any).status === 'cancelada'}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                (sale as any).status === 'cancelada'
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                              title={(sale as any).status === 'cancelada' ? 'Venta ya cancelada' : 'Cancelar venta'}
                            >
                              {(sale as any).status === 'cancelada' ? 'Cancelada' : 'Cancelar'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-400">
                    Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                    {pagination.totalItems} ventas
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Seleccionar Producto"
        darkMode={true}
      >
        <div className="space-y-4">
          <Input
            placeholder="Buscar productos..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            darkMode={true}
          />
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between p-3 bg-gray-700 rounded-lg transition-colors ${
                  product.stock > 0 
                    ? 'cursor-pointer hover:bg-gray-600' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => product.stock > 0 && handleAddProduct(product)}
              >
                <div className="flex-1">
                  <h4 className="text-white font-medium">{product.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`${product.stock <= 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      Stock: {product.stock}
                    </span>
                    <span className="text-gray-400">{formatCurrency(product.price, 'PEN')}</span>
                    {product.stock <= 0 && (
                      <span className="text-red-400 font-medium">Sin stock</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  darkMode={true}
                  disabled={product.stock <= 0}
                >
                  Agregar
                </Button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                No se encontraron productos
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Seleccionar Cliente"
        darkMode={true}
      >
        <div className="space-y-4">
          <Input
            placeholder="Buscar clientes..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            darkMode={true}
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => handleSelectCustomer(null)}
            >
              <div>
                <h4 className="text-white font-medium">Cliente General</h4>
                <p className="text-gray-400 text-sm">Venta sin cliente específico</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                darkMode={true}
              >
                Seleccionar
              </Button>
            </div>
            {filteredCustomers.map((customer: Customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => handleSelectCustomer(customer)}
              >
                <div>
                  <h4 className="text-white font-medium">
                    {customer.firstName} {customer.lastName}
                  </h4>
                  <p className="text-gray-400 text-sm">{customer.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  darkMode={true}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
            {filteredCustomers.length === 0 && customerSearch && (
              <p className="text-gray-400 text-center py-4">
                No se encontraron clientes
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Venta Completada"
        darkMode={true}
      >
        {lastSale && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                ¡Venta Exitosa!
              </div>
              <div className="text-gray-300">
                Venta #{lastSale.id} - {formatDate(lastSale.createdAt)}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-lg font-bold text-center text-white">
                Total: {formatCurrency(lastSale.total, 'PEN')}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowReceiptModal(false)}
                variant="secondary"
                className="flex-1"
                darkMode={true}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setShowReceiptModal(false);
                  // Aquí podrías agregar lógica para imprimir el recibo
                }}
                variant="primary"
                className="flex-1"
                darkMode={true}
              >
                Imprimir Recibo
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSale}
        title="Cancelar Venta"
        message={
          deletingSale 
            ? `¿Está seguro de que desea cancelar la venta #${deletingSale.id}? 
               
               Esta acción:
               • Marcará la venta como cancelada
               • Restaurará el stock de los productos (si están activos)
               • Actualizará las estadísticas del cliente
               • La venta permanecerá en el historial para auditoría`
            : ''
        }
        confirmText="Cancelar Venta"
        variant="danger"
        darkMode={true}
      />

      {/* Sale Details Modal */}
      <Modal
        isOpen={showSaleDetailsModal}
        onClose={() => setShowSaleDetailsModal(false)}
        title={`Detalles de Venta #${selectedSaleForDetails?.id || ''}`}
        darkMode={true}
        size="xl"
      >
        {selectedSaleForDetails && (
          <div className="space-y-6">
            {/* Información General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">Información de la Venta</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Número de Venta:</span>
                    <span className="text-white">#{selectedSaleForDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha:</span>
                    <span className="text-white">{formatDate(selectedSaleForDetails.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                      Completada
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vendedor:</span>
                    <span className="text-white">
                      {selectedSaleForDetails.creator 
                        ? `${selectedSaleForDetails.creator.firstName} ${selectedSaleForDetails.creator.lastName}`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  {selectedSaleForDetails.notes && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Notas:</span>
                      <span className="text-white">{selectedSaleForDetails.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">Cliente</h4>
                <div className="space-y-2">
                  {selectedSaleForDetails.customer ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nombre:</span>
                        <span className="text-white">
                          {selectedSaleForDetails.customer.firstName} {selectedSaleForDetails.customer.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedSaleForDetails.customer.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Teléfono:</span>
                        <span className="text-white">{selectedSaleForDetails.customer.phone || 'N/A'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">Cliente general</div>
                  )}
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-4">Productos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-400">Producto</th>
                      <th className="text-right py-2 text-gray-400">Precio Unit.</th>
                      <th className="text-center py-2 text-gray-400">Cantidad</th>
                      <th className="text-right py-2 text-gray-400">Descuento</th>
                      <th className="text-right py-2 text-gray-400">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSaleForDetails.details?.map((detail: any, index: number) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-2 text-white">
                          <div>
                            <div className="font-medium">{detail.product?.name || 'Producto'}</div>
                            <div className="text-xs text-gray-400">{detail.product?.sku || ''}</div>
                          </div>
                        </td>
                        <td className="text-right py-2 text-white">
                          {formatCurrency(detail.unitPrice, 'PEN')}
                        </td>
                        <td className="text-center py-2 text-white">
                          {detail.quantity}
                        </td>
                        <td className="text-right py-2 text-white">
                          {detail.discount > 0 ? formatCurrency(detail.discount, 'PEN') : '-'}
                        </td>
                        <td className="text-right py-2 font-medium text-white">
                          {formatCurrency(detail.total || detail.subtotal, 'PEN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-4">Resumen</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Imponible:</span>
                  <span className="text-white">{formatCurrency(selectedSaleForDetails.subtotal, 'PEN')}</span>
                </div>
                {selectedSaleForDetails.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Descuento:</span>
                    <span className="text-red-400">-{formatCurrency(selectedSaleForDetails.discount, 'PEN')}</span>
                  </div>
                )}
                {selectedSaleForDetails.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">IGV (18%):</span>
                    <span className="text-white">{formatCurrency(selectedSaleForDetails.tax, 'PEN')}</span>
                  </div>
                )}
                <hr className="border-gray-700" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-green-400">{formatCurrency(selectedSaleForDetails.total, 'PEN')}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setShowSaleDetailsModal(false)}
                variant="secondary"
                className="flex-1"
                darkMode={true}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  // Aquí podrías agregar lógica para imprimir la venta
                }}
                variant="primary"
                className="flex-1"
                darkMode={true}
              >
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesPage;
