import { describe, it, expect } from '@jest/globals';
import { allocationSumMatches, accountsForCurrency } from '../utils/incomeAllocation';
import type { FinancialAccount } from '@/shared/types';

function account(overrides: Partial<FinancialAccount> = {}): FinancialAccount {
  return {
    id: 'acc-1',
    name: 'Checking',
    type: 'bank',
    institution: null,
    accountNumberLast4: null,
    balance: 1000,
    creditLimit: null,
    currency: 'INR',
    isActive: true,
    ...overrides,
  };
}

describe('allocationSumMatches', () => {
  it('is false with no entries', () => {
    expect(allocationSumMatches({}, 500)).toBe(false);
  });

  it('is true when entries sum exactly to the income amount', () => {
    expect(allocationSumMatches({ a: '300', b: '200' }, 500)).toBe(true);
  });

  it('tolerates sub-paisa floating point drift', () => {
    expect(allocationSumMatches({ a: '333.33', b: '166.67' }, 500)).toBe(true);
  });

  it('is false when entries do not sum to the income amount', () => {
    expect(allocationSumMatches({ a: '100', b: '200' }, 500)).toBe(false);
  });

  it('treats a non-numeric entry as zero rather than throwing', () => {
    expect(allocationSumMatches({ a: '', b: '500' }, 500)).toBe(true);
  });
});

describe('accountsForCurrency', () => {
  it('keeps only accounts matching the given currency', () => {
    const accounts = [
      account({ id: '1', currency: 'INR' }),
      account({ id: '2', currency: 'USD' }),
      account({ id: '3', currency: 'INR' }),
    ];
    const result = accountsForCurrency(accounts, 'INR');
    expect(result.map((a) => a.id)).toEqual(['1', '3']);
  });

  it('returns an empty array when nothing matches', () => {
    const accounts = [account({ currency: 'USD' })];
    expect(accountsForCurrency(accounts, 'INR')).toEqual([]);
  });
});
