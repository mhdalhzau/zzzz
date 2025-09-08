/**
 * Format number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) {
    return 'Rp 0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse currency string to number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remove currency symbol and formatting
  const numberString = currencyString
    .replace(/Rp\s?/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
    
  return parseFloat(numberString) || 0;
}

/**
 * Format number as compact currency (e.g., 1.2M, 500K)
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(amount: number): string {
  if (isNaN(amount)) {
    return 'Rp 0';
  }

  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`;
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}K`;
  } else {
    return formatCurrency(amount);
  }
}

/**
 * Validate if string is a valid currency format
 * @param value - The value to validate
 * @returns True if valid currency format
 */
export function isValidCurrency(value: string): boolean {
  const numberValue = parseCurrency(value);
  return !isNaN(numberValue) && numberValue >= 0;
}
