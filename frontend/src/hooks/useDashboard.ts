import { useState, useEffect } from 'react';
import { apiService } from '../services';

interface DashboardStats {
  todaySales: {
    count: number;
    total: number;
  };
  monthSales: {
    count: number;
    total: number;
  };
  lowStockProducts: number;
  totalProducts: number;
  totalCustomers: number;
  salesByMonth: Array<{
    month: string;
    salesCount: number;
    totalRevenue: number;
  }>;
  topProducts: Array<{
    productId: number;
    totalQuantity: number;
    totalRevenue: number;
    'product.name': string;
    'product.sku': string;
  }>;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get('/reports/dashboard');
      setStats(response.data.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMsg);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchDashboardStats
  };
};
