import { useState, useCallback } from 'react';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import type { User } from '@/shared/types';

export interface OnboardingForm {
  name: string;
  country: string;
  currency: string;
  financialGoals: string[];
  salaryRange: string;
  monthlySavingsTarget: string;
}

export function useOnboarding() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const toggleGoal = (goal: string) => {
    clearSubmitError();
    const updated = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(updated);
  };

  const submit = async (data: OnboardingForm) => {
    setSubmitError(null);
    if (selectedGoals.length === 0) {
      setSubmitError('Please select at least one financial goal');
      return;
    }

    setLoading(true);
    try {
      const user = await apiPost<User>('/users/onboarding', {
        ...data,
        financialGoals: selectedGoals,
        monthlySavingsTarget: Number(data.monthlySavingsTarget),
      });
      dispatch(setUser(user));
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to save onboarding data'));
    } finally {
      setLoading(false);
    }
  };

  return { loading, selectedGoals, toggleGoal, submit, submitError, clearSubmitError };
}
