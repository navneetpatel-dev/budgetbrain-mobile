export function getCurrencySymbol(currency: string) {
  return currency === 'INR' ? '₹' : `${currency} `;
}

export function formatCurrency(amount: number, currency: string) {
  return `${getCurrencySymbol(currency)}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
