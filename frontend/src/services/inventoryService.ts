import { apiService } from './apiService';
import type { 
  Product, 
  Category, 
  SearchFilters, 
  ProductFormData, 
  CategoryFormData,
  StockUpdateData,
  ApiResponse 
} from '../types';

export const inventoryService = {
  // ===== PRODUCTOS =====
  
  async getProducts(filters?: SearchFilters): Promise<{ 
    products: Product[], 
    pagination: any
  }> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.lowStock) params.append('lowStock', filters.lowStock.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiService.get<ApiResponse<{
      products: Product[],
      pagination: any
    }>>(`/products?${params.toString()}`);
    
    return response.data!.data!;
  },

  async getLowStockProducts(): Promise<Product[]> {
    const response = await apiService.get<ApiResponse<Product[]>>('/products/low-stock');
    return response.data!.data!;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await apiService.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data!.data!;
  },

  async createProduct(productData: ProductFormData): Promise<Product> {
    const response = await apiService.post<ApiResponse<Product>>('/products', productData);
    return response.data!.data!;
  },

  async updateProduct(id: number, productData: Partial<ProductFormData>): Promise<Product> {
    const response = await apiService.put<ApiResponse<Product>>(`/products/${id}`, productData);
    return response.data!.data!;
  },

  async updateProductStock(id: number, stockData: StockUpdateData): Promise<any> {
    const response = await apiService.put<ApiResponse<any>>(`/products/${id}/stock`, stockData);
    return response.data!.data!;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiService.delete(`/products/${id}`);
  },

  // ===== CATEGORÍAS =====

  async getCategories(filters?: { 
    search?: string, 
    isActive?: boolean, 
    page?: number, 
    limit?: number 
  }): Promise<{ 
    categories: Category[], 
    pagination: any
  }> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiService.get<ApiResponse<{
      categories: Category[],
      pagination: any
    }>>(`/categories?${params.toString()}`);
    
    return response.data!.data!;
  },

  async getActiveCategories(): Promise<Category[]> {
    const response = await apiService.get<ApiResponse<Category[]>>('/categories/active');
    return response.data!.data!;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiService.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data!.data!;
  },

  async getCategoryStats(): Promise<any[]> {
    const response = await apiService.get<ApiResponse<any[]>>('/categories/stats');
    return response.data!.data!;
  },

  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    const response = await apiService.post<ApiResponse<Category>>('/categories', categoryData);
    return response.data!.data!;
  },

  async updateCategory(id: number, categoryData: Partial<CategoryFormData>): Promise<Category> {
    const response = await apiService.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    return response.data!.data!;
  },

  async deleteCategory(id: number, force: boolean = false): Promise<void> {
    const queryParam = force ? '?force=true' : '';
    await apiService.delete(`/categories/${id}${queryParam}`);
  }
};