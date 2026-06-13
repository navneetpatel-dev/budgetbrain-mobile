import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/shared/services/api';
import type { IncomeSource, Transaction } from '@/shared/types';

export interface IncomeForm {
  amount: string;
  notes: string;
  date: string;
  incomeSourceId: string;
  newSourceName: string;
  newSourceType: string;
}

export function useCreateIncome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const create = async (data: IncomeForm, showNewSource: boolean) => {
    setLoading(true);
    try {
      let incomeSourceId = data.incomeSourceId;

      if (showNewSource && data.newSourceName) {
        const source = await apiPost<IncomeSource>('/income/sources', {
          name: data.newSourceName,
          type: data.newSourceType,
        });
        incomeSourceId = source.id;
        queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      }

      await apiPost<Transaction>('/income', {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
        incomeSourceId: incomeSourceId || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save income');
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
}
