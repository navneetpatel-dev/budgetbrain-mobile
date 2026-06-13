import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/src/shared/services/api';

export interface ContributeForm {
  amount: string;
  notes: string;
}

export function useContributeGoal(goalId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const contribute = async (data: ContributeForm) => {
    setLoading(true);
    try {
      await apiPost(`/goals/${goalId}/contribute`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not add contribution');
    } finally {
      setLoading(false);
    }
  };

  return { contribute, loading };
}
