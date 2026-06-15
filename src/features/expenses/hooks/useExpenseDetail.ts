import { useState, useCallback } from 'react';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
import type { Transaction } from '@/shared/types';

export interface ExpenseForm {
  amount: string;
  merchant: string;
  notes: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
}

export function useExpenseDetail(expenseId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitInfo, setSubmitInfo] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const clearFeedback = useCallback(() => {
    setSubmitError(null);
    setSubmitInfo(null);
    setSubmitSuccess(null);
  }, []);

  const { data: expense, isLoading } = useQuery({
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
    });
    setEditing(true);
  };

  const update = async (data: ExpenseForm) => {
    setLoading(true);
    clearFeedback();
    const payload = {
      id: expenseId,
      amount: Number(data.amount),
      merchant: data.merchant || undefined,
      notes: data.notes || undefined,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      date: data.date,
    };
    try {
      if (!(await isOnline())) {
        queueOfflineAction('update', payload);
        setEditing(false);
        setSubmitInfo('Changes will sync when you reconnect.');
        return;
      }
      await apiPatch(`/expenses/${expenseId}`, payload);
      queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditing(false);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update expense'));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    clearFeedback();
    try {
      if (!(await isOnline())) {
        queueOfflineAction('delete', { id: expenseId });
        router.back();
        return;
      }
      await apiDelete(`/expenses/${expenseId}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not delete expense'));
    } finally {
      setLoading(false);
    }
  };

  const duplicate = async () => {
    setLoading(true);
    clearFeedback();
    try {
      await apiPost(`/expenses/${expenseId}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSubmitSuccess('A copy of this expense was created.');
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not duplicate expense'));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showConfirmation(CONFIRM.deleteExpense, remove);
  };

  return {
    expense,
    isLoading,
    editing,
    setEditing,
    loading,
    startEditing,
    update,
    remove,
    duplicate,
    confirmDelete,
    submitError,
    submitInfo,
    submitSuccess,
    clearFeedback,
  };
}
