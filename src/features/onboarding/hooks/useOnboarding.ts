import { useState, useCallback } from 'react';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { registerForPushNotifications } from '@/shared/services/notifications';
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const submit = async (data: OnboardingForm) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const user = await apiPost<User>('/users/onboarding', {
        ...data,
        monthlySavingsTarget: Number(data.monthlySavingsTarget),
      });
      dispatch(setUser(user));
      // Now the user has real context (just finished telling us about their finances) —
      // the right moment to ask for push permission, not on their very first cold start.
      registerForPushNotifications().catch(() => {});
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to save onboarding data'));
    } finally {
      setLoading(false);
    }
  };

  return { loading, submit, submitError, clearSubmitError };
}
