import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import type { Transaction } from '@/shared/types';

export interface IncomeForm {
  amount: string;
  notes: string;
  date: string;
}

export function useIncomeDetail(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data: income, isLoading } = useQuery({
    queryKey: ['income', id],
    queryFn: () => apiGet<Transaction>(`/income/${id}`),
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<IncomeForm>) => {
      if (!income) return;
      reset({ amount: String(income.amount), notes: income.notes ?? '', date: income.date });
    },
    [income],
  );

  const save = async (data: IncomeForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await apiPatch(`/income/${id}`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
      });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      router.back();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update income'));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete Income', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          setSubmitError(null);
          try {
            await apiDelete(`/income/${id}`);
            queryClient.invalidateQueries({ queryKey: ['income'] });
            router.back();
          } catch (err) {
            setSubmitError(getApiErrorMessage(err, 'Could not delete income'));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return { income, isLoading, loading, save, populateForm, confirmDelete, submitError, clearSubmitError };
}
