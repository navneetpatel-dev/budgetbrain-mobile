import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { uploadReceipt } from '@/features/expenses/services/receipts';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
import { trackEvent } from '@/shared/services/analytics';
import type { Transaction } from '@/shared/types';
import type { Receipt } from '@/features/expenses/hooks/useReceiptPicker';

export interface ExpenseForm {
  amount: string;
  merchant: string;
  notes: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
  tags: string[];
}

export type CreateExpenseResult =
  | { ok: true; offline: boolean }
  | { ok: false; error: 'validation' | 'offline' | 'unknown' };

export function useCreateExpense() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const create = async (data: ExpenseForm, receipt?: Receipt | null): Promise<CreateExpenseResult> => {
    if (!data.categoryId) {
      return { ok: false, error: 'validation' };
    }

    const payload = {
      type: 'expense' as const,
      amount: Number(data.amount),
      merchant: data.merchant || undefined,
      notes: data.notes || undefined,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      date: data.date,
      tags: data.tags?.length ? data.tags : undefined,
    };

    setLoading(true);
    try {
      const online = await isOnline();

      if (!online) {
        queueOfflineAction('create', payload);
        invalidateMoneyQueries(queryClient);
        router.back();
        return { ok: true, offline: true };
      }

      const transaction = await apiPost<Transaction>('/expenses', payload);

      if (receipt && transaction?.id) {
        await uploadReceipt(transaction.id, receipt.uri, receipt.name, receipt.type);
      }

      trackEvent('expense_created', { amount: payload.amount, hasReceipt: !!receipt });
      invalidateMoneyQueries(queryClient);
      router.back();
      return { ok: true, offline: false };
    } catch {
      queueOfflineAction('create', payload);
      invalidateMoneyQueries(queryClient);
      router.back();
      return { ok: false, error: 'offline' };
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
}
