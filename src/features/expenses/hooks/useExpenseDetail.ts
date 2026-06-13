import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, apiPost } from '@/src/shared/services/api';
import { queueOfflineAction, isOnline } from '@/src/shared/services/offlineSync';
import type { Transaction } from '@/src/shared/types';

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

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      const result = await apiGet<{ transactions: Transaction[] }>('/expenses', { type: 'expense', limit: 200 });
      const found = result.transactions.find((t) => t.id === expenseId);
      if (!found) throw new Error('Expense not found');
      return found;
    },
    enabled: !!expenseId,
  });

  const startEditing = (reset: UseFormReset<ExpenseForm>) => {
    if (!expense) return;
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
        return { ok: true as const, offline: true };
      }
      await apiPatch(`/expenses/${expenseId}`, payload);
      queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditing(false);
      return { ok: true as const, offline: false };
    } catch {
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      if (!(await isOnline())) {
        queueOfflineAction('delete', { id: expenseId });
        router.back();
        return { ok: true as const, offline: true };
      }
      await apiDelete(`/expenses/${expenseId}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
      return { ok: true as const, offline: false };
    } catch {
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  };

  const duplicate = async () => {
    setLoading(true);
    try {
      await apiPost(`/expenses/${expenseId}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete Expense', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await remove();
          if (result.ok && result.offline) {
            Alert.alert('Queued', 'Delete will sync when you reconnect.');
          } else if (!result.ok) {
            Alert.alert('Error', 'Could not delete expense');
          }
        },
      },
    ]);
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
  };
}
