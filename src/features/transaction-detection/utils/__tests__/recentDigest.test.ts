import { describe, expect, it } from '@jest/globals';
import type { Transaction } from '@/shared/types';
import { toRecentTransactions } from '../recentDigest';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 't1',
    type: 'expense',
    amount: 1250,
    currency: 'INR',
    categoryId: null,
    notes: null,
    merchant: 'Swiggy',
    date: '2026-09-22',
    paymentMethod: null,
    source: 'manual',
    ...overrides,
  };
}

describe('toRecentTransactions', () => {
  it('maps amounts, directions and sources the way core reads them, newest first', () => {
    const digest = toRecentTransactions([
      tx({ id: 'a', amount: '1250.50' as unknown as number, date: '2026-09-20T00:00:00.000Z' }),
      tx({ id: 'b', type: 'refund', source: 'detected', merchant: 'SWIGGY LTD', date: '2026-09-23' }),
      tx({ id: 'c', type: 'transfer', direction: 'CREDIT', source: 'import', merchant: null, date: '2026-09-21' }),
      tx({ id: 'd', type: 'income', amount: 99, currency: 'JPY', date: '2026-09-22' }),
    ]);
    expect(digest.map((t) => t.id)).toEqual(['b', 'd', 'c', 'a']);
    expect(digest.find((t) => t.id === 'a')).toEqual({
      id: 'a',
      amountMinor: 125050,
      currency: 'INR',
      direction: 'DEBIT',
      transactionType: 'expense',
      date: '2026-09-20',
      source: 'manual',
      merchantKey: 'swiggy',
    });
    expect(digest.find((t) => t.id === 'b')).toMatchObject({ direction: 'CREDIT', source: 'detected' });
    expect(digest.find((t) => t.id === 'c')).toMatchObject({ direction: 'CREDIT', source: 'detected', merchantKey: null });
    expect(digest.find((t) => t.id === 'd')).toMatchObject({ direction: 'CREDIT', amountMinor: 99 });
  });

  it('leaves out rows core cannot use', () => {
    expect(
      toRecentTransactions([
        tx({ currency: 'XXQ' }),
        tx({ amount: 'abc' as unknown as number }),
        tx({ amount: 0 }),
        tx({ date: 'yesterday' }),
        tx({ type: 'transfer', direction: null }),
      ])
    ).toEqual([]);
  });
});
