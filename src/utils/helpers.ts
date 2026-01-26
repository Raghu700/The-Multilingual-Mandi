/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Get price color based on value within range
 */
export function getPriceColor(
  price: number,
  minPrice: number,
  maxPrice: number
): 'red' | 'yellow' | 'green' {
  const range = maxPrice - minPrice;
  const threshold1 = minPrice + range * 0.33;
  const threshold2 = minPrice + range * 0.67;
  
  if (price <= threshold1) return 'red';
  if (price <= threshold2) return 'yellow';
  return 'green';
}

/**
 * Get trend icon
 */
export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
  }
}
