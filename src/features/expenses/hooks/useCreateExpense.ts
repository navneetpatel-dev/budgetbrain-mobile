import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
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

/** How long the success confirmation stays visible before navigating back. */
const SAVE_CONFIRM_DELAY_MS = 900;

export function useCreateExpense() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const create = async (data: ExpenseForm, receipt?: Receipt | null): Promise<CreateExpenseResult> => {
    setSubmitError(null);
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
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
      return { ok: true, offline: false };
    } catch (err) {
      // No response at all (device thought it was online but the request never reached the
      // server) is the one case still worth silently queueing for offline sync. Any error the
      // server actually returned (validation, auth, 5xx) is a real failure the user needs to see.
      const isGenuineNetworkFailure = axios.isAxiosError(err) && !err.response;
      if (isGenuineNetworkFailure) {
        queueOfflineAction('create', payload);
        invalidateMoneyQueries(queryClient);
        router.back();
        return { ok: true, offline: true };
      }

      setSubmitError(getApiErrorMessage(err, 'Could not save expense'));
      return { ok: false, error: 'unknown' };
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
    submitError,
    clearSubmitError: () => setSubmitError(null),
    justSaved,
  };
}
