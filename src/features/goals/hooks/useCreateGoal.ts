import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateGoalQueries } from '@/shared/services/queryInvalidation';
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const create = async (data: GoalForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await apiPost<Goal>('/goals', {
        name: data.name,
        type: data.type,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || undefined,
      });
      invalidateGoalQueries(queryClient);
      router.back();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not create goal'));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError };
}
