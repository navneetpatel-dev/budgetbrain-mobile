import { isSupportedCurrency, merchantKey, parseDecimalToMinor, type RecentTransaction } from '@budgetbrain/detection-core';
import type { Transaction } from '@/shared/types';

/**
 * The user's recent transactions as core reads them (plan T3.7, T3.12): enough to spot an
 * alert for something the user already entered by hand, and to pair refunds and transfer legs.
 * Rows core can't use (unknown currency, unreadable amount or date) are left out.
 */
export function toRecentTransactions(transactions: readonly Transaction[]): RecentTransaction[] {
  const out: RecentTransaction[] = [];
  for (const t of transactions) {
    const direction = t.type === 'expense' ? 'DEBIT' : t.type === 'income' || t.type === 'refund' ? 'CREDIT' : t.direction;
    const date = typeof t.date === 'string' ? t.date.slice(0, 10) : '';
    if (!direction || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isSupportedCurrency(t.currency)) continue;
    let amountMinor: number;
    try {
      // The API may send amounts as strings; core wants integer minor units.
      amountMinor = parseDecimalToMinor(t.amount, t.currency);
    } catch {
      continue;
    }
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) continue;
    const key = t.merchant ? merchantKey(t.merchant) : '';
    out.push({
      id: t.id,
      amountMinor,
      currency: t.currency,
      direction,
      transactionType: t.type,
      date,
      // Imports and bank feeds count as machine-made, like detected ones: only a hand entry is "manual".
      source: t.source === 'manual' || t.source === undefined ? 'manual' : 'detected',
      merchantKey: key || null,
    });
  }
  // Newest first, as core expects.
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
