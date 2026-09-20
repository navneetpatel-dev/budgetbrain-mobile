import type { FinancialAccount } from '@/shared/types';

/** Pure gate: is the sum of entered allocation amounts within a paisa of the income total? */
export function allocationSumMatches(entries: Record<string, string>, incomeAmount: number): boolean {
  const ids = Object.keys(entries);
  if (ids.length === 0) return false;
  const total = ids.reduce((sum, id) => sum + (Number(entries[id]) || 0), 0);
  return Math.abs(total - incomeAmount) < 0.01;
}

/** Only accounts whose currency matches the income transaction's — cross-currency splits are
 *  rejected server-side, so the picker never offers a combination that would just 400 later. */
export function accountsForCurrency(accounts: FinancialAccount[], currency: string): FinancialAccount[] {
  return accounts.filter((a) => a.currency === currency);
}
