import type { FinancialAccount, IncomeAllocation } from '@/shared/types';

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

/** Builds the { financialAccountId: amountString } form-state shape from a transaction's
 *  existing allocations, so re-opening the split panel pre-fills instead of starting blank. */
export function buildPrefillFromAllocations(
  existingAllocations: IncomeAllocation[] | undefined
): Record<string, string> {
  if (!existingAllocations || existingAllocations.length === 0) return {};
  const prefill: Record<string, string> = {};
  for (const a of existingAllocations) {
    prefill[a.financialAccountId] = String(a.amount);
  }
  return prefill;
}
