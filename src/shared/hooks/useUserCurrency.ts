import { useAppSelector } from '@/src/shared/store/hooks';
import { formatCurrency, getCurrencySymbol } from '@/src/shared/utils/currency';

export function useUserCurrency() {
  const currency = useAppSelector((s) => s.auth.user?.currency ?? 'INR');
  const symbol = getCurrencySymbol(currency).trim();
  return {
    currency,
    symbol,
    format: (amount: number) => formatCurrency(amount, currency),
    amountLabel: (label: string) => `${label} (${getCurrencySymbol(currency).trim()})`,
  };
}
