import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateGoalQueries } from '@/shared/services/queryInvalidation';
import type { Goal } from '@/shared/types';

export interface ContributeForm {
  amount: string;
  notes: string;
}

const SAVE_CONFIRM_DELAY_MS = 900;

export function useContributeGoal(goalId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const contribute = async (data: ContributeForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const result = await apiPost<{ goal: Goal }>(`/goals/${goalId}/contribute`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
      });
      if (result?.goal) {
        queryClient.setQueryData(['goal', goalId], result.goal);
      }
      invalidateGoalQueries(queryClient, goalId);
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not add contribution'));
    } finally {
      setLoading(false);
    }
  };

  return { contribute, loading, submitError, clearSubmitError, justSaved };
}
