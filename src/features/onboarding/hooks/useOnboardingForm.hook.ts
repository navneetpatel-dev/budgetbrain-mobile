import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '@/shared/store/hooks';
import { useLogout } from '@/features/settings/hooks/useLogout.hook';
import { useOnboarding, type OnboardingForm } from './useOnboarding.hook';

/** Screen-level orchestration for the onboarding form: field defaults, back-button block, and submit wiring. */
export function useOnboardingScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const { loading, submit, submitError } = useOnboarding();
  const handleLogout = useLogout();

  // Prevent back navigation via Android hardware back button — onboarding is mandatory.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const form = useForm<OnboardingForm>({
    defaultValues: {
      name: user?.name || '',
      country: user?.country || 'India',
      currency: user?.currency || 'INR',
      financialGoals: [],
      salaryRange: '',
      monthlySavingsTarget: '',
    },
  });

  const selectedCurrency = form.watch('currency');

  return { form, selectedCurrency, loading, submit, submitError, handleLogout };
}
