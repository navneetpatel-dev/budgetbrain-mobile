import { toSafeNumber } from './number';

export function getCurrencySymbol(currency: string) {
  return currency === 'INR' ? '₹' : `${currency} `;
}

export function formatCurrency(amount: unknown, currency: string) {
  const safe = toSafeNumber(amount);
  return `${getCurrencySymbol(currency)}${safe.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
