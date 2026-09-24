import { describe, expect, it } from '@jest/globals';
import { buildConfirmOverrides, type DetectedEditValues } from '../confirmOverrides';
import type { DetectedTransactionDto } from '../../types/transactionDetection.types';

const ITEM = {
  id: 'd1',
  merchant: 'Zomato',
  transactionType: 'expense',
  categoryId: 'food',
  financialAccountId: null,
} as DetectedTransactionDto;

const unchanged: DetectedEditValues = { merchant: 'Zomato', transactionType: 'expense', categoryId: 'food', financialAccountId: '', notes: '' };

describe('buildConfirmOverrides (T5.1, T5.2)', () => {
  it('sends nothing when nothing changed, so the server learns nothing', () => {
    expect(buildConfirmOverrides(ITEM, unchanged)).toEqual({});
    expect(buildConfirmOverrides(ITEM, { ...unchanged, merchant: '  Zomato ' })).toEqual({});
  });

  it('sends only the changed fields', () => {
    expect(buildConfirmOverrides(ITEM, { ...unchanged, categoryId: 'office', notes: ' team lunch ' })).toEqual({
      categoryId: 'office',
      notes: 'team lunch',
    });
    expect(buildConfirmOverrides(ITEM, { ...unchanged, merchant: 'Zomato Gold', financialAccountId: 'acc-1' })).toEqual({
      merchant: 'Zomato Gold',
      financialAccountId: 'acc-1',
    });
    expect(buildConfirmOverrides(ITEM, { ...unchanged, categoryId: '' })).toEqual({ categoryId: null });
  });

  it('never sends a category for a transfer', () => {
    expect(buildConfirmOverrides(ITEM, { ...unchanged, transactionType: 'transfer', categoryId: 'office' })).toEqual({
      transactionType: 'transfer',
    });
  });
});
