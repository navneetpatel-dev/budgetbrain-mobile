import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Screen, FormFieldLabel, OptionChips, MultiOptionChips } from '@/shared/components/ui';
import { useOnboarding, type OnboardingForm } from '@/features/onboarding/hooks/useOnboarding';
import { SUPPORTED_CURRENCIES, FINANCIAL_GOALS, SALARY_RANGES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { getCurrencySymbol } from '@/shared/utils/currency';

export default function OnboardingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, selectedGoals, toggleGoal, submit } = useOnboarding();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<OnboardingForm>({
    defaultValues: {
      name: '',
      country: 'India',
      currency: 'INR',
      financialGoals: [],
      salaryRange: '',
      monthlySavingsTarget: '',
    },
  });

  const selectedCurrency = watch('currency');

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>WELCOME</Text>
        <Text style={styles.title}>Let's personalize your experience</Text>
      </View>

      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Your Name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="personFill" />
        )}
      />

      <Controller
        control={control}
        name="country"
        rules={{ required: 'Country is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Country" value={value} onChangeText={onChange} error={errors.country?.message} />
        )}
      />

      <FormFieldLabel>Currency</FormFieldLabel>
      <Controller
        control={control}
        name="currency"
        render={({ field: { onChange, value } }) => (
          <OptionChips options={[...SUPPORTED_CURRENCIES]} value={value} onChange={onChange} />
        )}
      />

      <FormFieldLabel>Financial Goals</FormFieldLabel>
      <MultiOptionChips options={[...FINANCIAL_GOALS]} selected={selectedGoals} onToggle={toggleGoal} />

      <FormFieldLabel>Salary Range</FormFieldLabel>
      <Controller
        control={control}
        name="salaryRange"
        rules={{ required: 'Select salary range' }}
        render={({ field: { onChange, value } }) => (
          <OptionChips options={[...SALARY_RANGES]} value={value} onChange={onChange} />
        )}
      />

      <Controller
        control={control}
        name="monthlySavingsTarget"
        rules={{ required: 'Savings target is required' }}
        render={({ field: { onChange, value } }) => (
          <Input
            label={`Monthly Savings Target (${getCurrencySymbol(selectedCurrency).trim()})`}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            error={errors.monthlySavingsTarget?.message}
          />
        )}
      />

      <Button title="Get Started" onPress={handleSubmit(submit)} loading={loading} size="lg" />
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    intro: { marginBottom: t.spacing.lg },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: t.colors.textTertiary,
      marginBottom: 4,
    },
    title: {
      ...t.typography.titleSm,
      fontSize: 22,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.3,
    },
  });
}
