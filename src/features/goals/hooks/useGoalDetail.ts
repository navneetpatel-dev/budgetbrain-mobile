import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import type { Goal } from '@/shared/types';

export interface GoalForm {
  name: string;
  targetAmount: string;
  targetDate: string;
}

export function useGoalDetail(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => apiGet<Goal>(`/goals/${id}`),
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<GoalForm>) => {
      if (!goal) return;
      reset({
        name: goal.name,
        targetAmount: String(goal.targetAmount),
        targetDate: goal.targetDate ?? '',
      });
    },
    [goal],
  );

  const save = async (data: GoalForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await apiPatch(`/goals/${id}`, {
        name: data.name,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', id] });
      router.back();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update goal'));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showConfirmation(CONFIRM.deleteGoal, async () => {
      setLoading(true);
      setSubmitError(null);
      try {
        await apiDelete(`/goals/${id}`);
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        router.back();
      } catch (err) {
        setSubmitError(getApiErrorMessage(err, 'Could not delete goal'));
      } finally {
        setLoading(false);
      }
    });
  };

  return { goal, isLoading, loading, save, populateForm, confirmDelete, submitError, clearSubmitError };
}
