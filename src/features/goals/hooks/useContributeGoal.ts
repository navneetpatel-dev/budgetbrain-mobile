import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';

export interface ContributeForm {
  amount: string;
  notes: string;
}

export function useContributeGoal(goalId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const contribute = async (data: ContributeForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await apiPost(`/goals/${goalId}/contribute`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not add contribution'));
    } finally {
      setLoading(false);
    }
  };

  return { contribute, loading, submitError, clearSubmitError };
}
