/**
 * Formats a number or string into Indonesian Rupiah (IDR) currency format.
 * @param amount The numerical value to format.
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number | string): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};
