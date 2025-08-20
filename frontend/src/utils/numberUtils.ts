/**
 * Formatea un numero como moneda
 */
export const formatCurrency = (amount: number, currency: string = 'PEN'): string => {
  const locale = currency === 'PEN' ? 'es-PE' : 'es-ES';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formatea un numero con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES').format(num);
};

/**
 * Calcula el porcentaje
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Redondea a decimales especificos
 */
export const roundToDecimals = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calcula el total con impuestos
 */
export const calculateTotalWithTax = (subtotal: number, taxRate: number = 0.21): number => {
  return subtotal * (1 + taxRate);
};

/**
 * Calcula solo los impuestos
 */
export const calculateTax = (subtotal: number, taxRate: number = 0.21): number => {
  return subtotal * taxRate;
};