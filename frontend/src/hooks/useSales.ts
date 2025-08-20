import { useState, useEffect } from 'react';
import { apiService } from '../services';
import type { Sale, Customer, Product } from '../types';

interface SaleSearchFilters {
  search?: string;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface SaleItem {
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

interface CreateSaleData {
  customerId?: number;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
}

export const useSales = (filters?: SaleSearchFilters) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state for creating sales
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/sales', { params: filters });
      setSales(response.data.data.sales || []); // Cambio aquí
      setPagination(response.data.data.pagination || null); // Cambio aquí
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas');
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createSale = async (saleData: CreateSaleData) => {
    try {
      setError(null);
      const response = await apiService.post('/sales', saleData);
      const newSale = response.data.data; // Cambio aquí
      setSales(prev => [newSale, ...prev]);
      // Clear cart after successful sale
      setCart([]);
      setSelectedCustomer(null);
      return newSale;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear venta';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getSaleById = async (id: number) => {
    try {
      const response = await apiService.get(`/sales/${id}`);
      return response.data.data; // Cambio aquí
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al obtener venta';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateSale = async (id: number, updateData: { status?: string; notes?: string }) => {
    try {
      setError(null);
      const response = await apiService.put(`/sales/${id}`, updateData);
      const updatedSale = response.data.data; // Cambio aquí
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      return updatedSale;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar venta';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteSale = async (id: number) => {
    try {
      setError(null);
      const response = await apiService.delete(`/sales/${id}`);
      
      // Mostrar advertencias si las hay
      if (response.data.warnings && response.data.warnings.length > 0) {
        alert(`Venta cancelada con advertencias:\n${response.data.warnings.join('\n')}`);
      }
      
      // Refrescar los datos desde el servidor para asegurar consistencia
      await fetchSales();
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cancelar venta';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Cart management functions
  const addToCart = (product: Product, quantity: number = 1) => {
    // Verificar que el producto esté activo
    if (!product.isActive) {
      return;
    }

    // Verificar que haya stock suficiente
    if (product.stock < quantity) {
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Verificar stock total después de la suma
        if (product.stock < newQuantity) {
          return prev;
        }

        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * item.price
              }
            : item
        );
      } else {
        return [...prev, {
          productId: product.id,
          product,
          quantity,
          price: product.price,
          subtotal: quantity * product.price
        }];
      }
    });
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          // Verificar stock disponible
          if (item.product.stock < quantity) {
            return item; // No actualizar si no hay stock
          }
          
          return {
            ...item,
            quantity,
            subtotal: quantity * item.price
          };
        }
        return item;
      })
    );
  };

  const updateCartItemPrice = (productId: number, price: number) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? {
              ...item,
              price,
              subtotal: item.quantity * price
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const getCartTotals = () => {
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0); // Total ya con IGV incluido
    const baseImponible = total / 1.18; // Base sin IGV (dividiendo por 1 + 18%)
    const tax = total - baseImponible; // IGV es la diferencia
    
    return {
      subtotal: baseImponible, // Base imponible (sin IGV)
      tax, // IGV calculado
      total, // Total con IGV (precio de productos)
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  useEffect(() => {
    fetchSales();
  }, [JSON.stringify(filters)]);

  return {
    // Sales data
    sales,
    pagination,
    isLoading,
    error,
    fetchSales,
    createSale,
    getSaleById,
    updateSale,
    deleteSale,
    refetchSales: fetchSales,
    
    // Cart management
    cart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    updateCartItemQuantity,
    updateCartItemPrice,
    removeFromCart,
    clearCart,
    getCartTotals
  };
};
