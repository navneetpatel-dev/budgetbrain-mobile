import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch } from '@/src/shared/services/api';
import type { Budget } from '@/src/shared/types';

export interface BudgetForm {
  name: string;
  amount: string;
  alertThreshold: string;
}

export function useBudgetDetail(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      const budgets = await apiGet<Budget[]>('/budgets');
      const found = budgets.find((b) => b.id === id);
      if (!found) throw new Error('Budget not found');
      return found;
    },
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<BudgetForm>) => {
      if (!budget) return;
      reset({
        name: budget.name,
        amount: String(budget.amount),
        alertThreshold: String(budget.alertThreshold),
      });
    },
    [budget],
  );

  const save = async (data: BudgetForm) => {
    setLoading(true);
    try {
      await apiPatch(`/budgets/${id}`, {
        name: data.name,
        amount: Number(data.amount),
        alertThreshold: Number(data.alertThreshold),
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not update budget');
    } finally {
      setLoading(false);
    }
  };

  return { budget, isLoading, loading, save, populateForm };
}
