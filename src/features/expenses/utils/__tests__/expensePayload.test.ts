import { describe, it, expect } from '@jest/globals';
import { buildExpensePayload } from '../expensePayload';
import type { ExpenseForm } from '@/features/expenses/types/expenses.types';

const base: ExpenseForm = {
  kind: 'expense',
  direction: 'DEBIT',
  amount: '250.50',
  merchant: 'Swiggy',
  notes: '',
  categoryId: 'cat-food',
  paymentMethod: 'upi',
  date: '2026-09-24',
  tags: [],
};

describe('buildExpensePayload', () => {
  it('builds an expense and requires its category', () => {
    expect(buildExpensePayload(base)).toEqual({
      ok: true,
      payload: { type: 'expense', amount: 250.5, merchant: 'Swiggy', categoryId: 'cat-food', paymentMethod: 'upi', date: '2026-09-24' },
    });
    expect(buildExpensePayload({ ...base, categoryId: '' })).toEqual({ ok: false, field: 'categoryId' });
  });

  it('builds a refund, keeping the category when chosen but not requiring it', () => {
    const withCategory = buildExpensePayload({ ...base, kind: 'refund' });
    expect(withCategory).toMatchObject({ ok: true, payload: { type: 'refund', categoryId: 'cat-food' } });
    const withoutCategory = buildExpensePayload({ ...base, kind: 'refund', categoryId: '' });
    expect(withoutCategory).toMatchObject({ ok: true, payload: { type: 'refund' } });
    expect(withoutCategory.ok && withoutCategory.payload.direction).toBeFalsy();
  });

  it('builds a transfer with its direction and never a category', () => {
    const res = buildExpensePayload({ ...base, kind: 'transfer', direction: 'CREDIT' });
    expect(res).toMatchObject({ ok: true, payload: { type: 'transfer', direction: 'CREDIT' } });
    expect(res.ok && res.payload.categoryId).toBeUndefined();
  });

  it('rejects a missing or zero amount', () => {
    expect(buildExpensePayload({ ...base, amount: '' })).toEqual({ ok: false, field: 'amount' });
    expect(buildExpensePayload({ ...base, amount: '0' })).toEqual({ ok: false, field: 'amount' });
  });
});
