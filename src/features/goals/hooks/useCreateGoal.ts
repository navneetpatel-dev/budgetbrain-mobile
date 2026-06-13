import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/shared/services/api';
import type { Goal } from '@/shared/types';

export interface GoalForm {
  name: string;
  type: string;
  targetAmount: string;
  targetDate: string;
}

export function useCreateGoal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const create = async (data: GoalForm) => {
    setLoading(true);
    try {
      await apiPost<Goal>('/goals', {
        name: data.name,
        type: data.type,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create goal');
    } finally {
      setLoading(false);
    }
  };

  return { create, loading };
}
