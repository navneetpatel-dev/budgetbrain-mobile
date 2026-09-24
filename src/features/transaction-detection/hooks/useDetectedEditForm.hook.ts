import { useMemo, useState } from 'react';
import { ALLOWED_TYPES_BY_DIRECTION } from '@budgetbrain/detection-core';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import type { Category, FinancialAccount } from '@/shared/types';
import type { DetectedTransactionDto } from '../types/transactionDetection.types';
import { buildConfirmOverrides, initialEditValues, NO_SELECTION, type DetectedEditValues, type EditableType } from '../utils/confirmOverrides';

/** State for the review Edit sheet (plan T5.1): category, merchant, type, account and note. */
export function useDetectedEditForm(item: DetectedTransactionDto | null) {
  const [values, setValues] = useState<DetectedEditValues>(() => initialEditValues(item));
  // Start over when the sheet opens for another item (reset during render, not in an effect).
  const [formItem, setFormItem] = useState(item);
  if (formItem !== item) {
    setFormItem(item);
    setValues(initialEditValues(item));
  }

  const categories = usePaginatedList<Category, 'categories'>({ queryKey: ['categories'], url: '/categories', itemsKey: 'categories' });
  const accounts = usePaginatedList<FinancialAccount, 'accounts'>({ queryKey: ['accounts'], url: '/accounts', itemsKey: 'accounts' });

  // Money out can only be an expense or a transfer; money in an income, refund or transfer.
  const typeOptions = useMemo(
    () => (item ? [...ALLOWED_TYPES_BY_DIRECTION[item.direction]] : ['expense' as EditableType]),
    [item]
  );
  const categoryItems = useMemo(
    () => [{ id: NO_SELECTION, label: 'None' }, ...categories.data.map((c) => ({ id: c.id, label: c.name, ...(c.color ? { color: c.color } : {}) }))],
    [categories.data]
  );
  const accountItems = useMemo(
    () => [
      { id: NO_SELECTION, label: 'No account' },
      ...accounts.data.map((a) => ({ id: a.id, label: a.accountNumberLast4 ? `${a.name} ••• ${a.accountNumberLast4}` : a.name })),
    ],
    [accounts.data]
  );

  const set = <K extends keyof DetectedEditValues>(key: K) => (value: DetectedEditValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  return {
    values,
    typeOptions,
    categoryItems,
    accountItems,
    showCategory: values.transactionType !== 'transfer',
    setMerchant: set('merchant'),
    setTransactionType: set('transactionType'),
    setCategoryId: set('categoryId'),
    setFinancialAccountId: set('financialAccountId'),
    setNotes: set('notes'),
    overrides: () => (item ? buildConfirmOverrides(item, values) : {}),
  };
}
