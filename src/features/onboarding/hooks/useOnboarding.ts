import { useState } from 'react';
import { Alert } from 'react-native';
import { apiPost } from '@/shared/services/api';
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

  const toggleGoal = (goal: string) => {
    const updated = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(updated);
  };

  const submit = async (data: OnboardingForm) => {
    if (selectedGoals.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one financial goal');
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
    } catch {
      Alert.alert('Error', 'Failed to save onboarding data');
    } finally {
      setLoading(false);
    }
  };

  return { loading, selectedGoals, toggleGoal, submit };
}
