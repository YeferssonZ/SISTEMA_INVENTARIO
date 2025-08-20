export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  categoryId: number;
  category?: Category;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: 'pza' | 'kg' | 'lt' | 'mt' | 'caja' | 'paquete';
  barcode?: string;
  isActive: boolean;
  createdBy: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  profitMargin?: number;
  stockStatus?: 'normal' | 'low' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  products?: Product[];
  productsCount?: number;
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  customerType?: 'individual' | 'empresa';
  rfc?: string;
  companyName?: string;
  isActive: boolean;
  totalPurchases?: number;
  lastPurchaseDate?: string;
  notes?: string;
  createdBy: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  // Campos virtuales
  fullName?: string;
  fullAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: number;
  customerId?: number;
  customer?: Customer;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  saleDate: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  details: SaleDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleDetail {
  id: number;
  saleId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  categoryId: number;
  price: number;
  cost: number;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  barcode?: string;
  isActive?: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface StockUpdateData {
  quantity: number;
  type: 'add' | 'subtract' | 'set';
  reason?: string;
}
