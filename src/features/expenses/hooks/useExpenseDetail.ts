import { useState, useCallback } from 'react';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
import type { Transaction } from '@/shared/types';

export interface ExpenseForm {
  amount: string;
  merchant: string;
  notes: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
  tags: string[];
}

type PendingAction = 'update' | 'duplicate' | 'delete' | null;

export function useExpenseDetail(expenseId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearFeedback = useCallback(() => {
    setSubmitError(null);
  }, []);

  const goHome = useCallback(() => {
    router.dismissTo('/(tabs)');
  }, [router]);

  const { data: expense, isLoading, isError, refetch } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => apiGet<Transaction>(`/expenses/${expenseId}`),
    enabled: !!expenseId,
  });

  const startEditing = (reset: UseFormReset<ExpenseForm>) => {
    if (!expense) return;
    clearFeedback();
    reset({
      amount: String(expense.amount),
      merchant: expense.merchant ?? '',
      notes: expense.notes ?? '',
      categoryId: expense.categoryId ?? '',
      paymentMethod: expense.paymentMethod ?? 'upi',
      date: expense.date,
      tags: expense.tags ?? [],
    });
    setEditing(true);
  };

  const update = async (data: ExpenseForm) => {
    setPendingAction('update');
    clearFeedback();
    const payload = {
      id: expenseId,
      amount: Number(data.amount),
      merchant: data.merchant || undefined,
      notes: data.notes || undefined,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      date: data.date,
      tags: data.tags,
    };
    try {
      if (!(await isOnline())) {
        queueOfflineAction('update', payload);
        queryClient.setQueryData<Transaction>(['expense', expenseId], (prev) =>
          prev
            ? {
                ...prev,
                amount: payload.amount,
                merchant: payload.merchant ?? null,
                notes: payload.notes ?? null,
                categoryId: payload.categoryId,
                paymentMethod: payload.paymentMethod,
                date: payload.date,
                tags: payload.tags,
              }
            : prev,
        );
        setEditing(false);
        return;
      }
      const updated = await apiPatch<Transaction>(`/expenses/${expenseId}`, payload);
      queryClient.setQueryData(['expense', expenseId], updated);
      void queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      invalidateMoneyQueries(queryClient);
      setEditing(false);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update expense'));
    } finally {
      setPendingAction(null);
    }
  };

  const remove = async () => {
    setPendingAction('delete');
    clearFeedback();
    try {
      if (!(await isOnline())) {
        queueOfflineAction('delete', { id: expenseId });
        void queryClient.removeQueries({ queryKey: ['expense', expenseId] });
        invalidateMoneyQueries(queryClient);
        goHome();
        return;
      }
      await apiDelete(`/expenses/${expenseId}`);
      void queryClient.removeQueries({ queryKey: ['expense', expenseId] });
      invalidateMoneyQueries(queryClient);
      goHome();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not delete expense'));
    } finally {
      setPendingAction(null);
    }
  };

  const duplicate = async () => {
    setPendingAction('duplicate');
    clearFeedback();
    try {
      await apiPost(`/expenses/${expenseId}/duplicate`);
      invalidateMoneyQueries(queryClient);
      goHome();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not duplicate expense'));
    } finally {
      setPendingAction(null);
    }
  };

  const confirmDelete = () => {
    showConfirmation(CONFIRM.deleteExpense, remove);
  };

  return {
    expense,
    isLoading,
    isError,
    refetch,
    editing,
    setEditing,
    loading: pendingAction !== null,
    updating: pendingAction === 'update',
    duplicating: pendingAction === 'duplicate',
    deleting: pendingAction === 'delete',
    startEditing,
    update,
    remove,
    duplicate,
    confirmDelete,
    submitError,
    clearFeedback,
  };
}
