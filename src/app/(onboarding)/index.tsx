import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Screen } from '@/shared/components/ui';
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
      <Text style={styles.title}>Welcome to ExpenseFlow</Text>
      <Text style={styles.subtitle}>Let's personalize your experience</Text>

      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Your Name" value={value} onChangeText={onChange} error={errors.name?.message} />
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

      <Text style={styles.sectionLabel}>Currency</Text>
      <Controller
        control={control}
        name="currency"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chipRow}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => onChange(c)}
                style={[styles.chip, value === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, value === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      <Text style={styles.sectionLabel}>Financial Goals</Text>
      <View style={styles.chipRow}>
        {FINANCIAL_GOALS.map((goal) => (
          <Pressable
            key={goal}
            onPress={() => toggleGoal(goal)}
            style={[styles.chip, selectedGoals.includes(goal) && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedGoals.includes(goal) && styles.chipTextActive]}>{goal}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Salary Range</Text>
      <Controller
        control={control}
        name="salaryRange"
        rules={{ required: 'Select salary range' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.chipRow}>
            {SALARY_RANGES.map((range) => (
              <Pressable
                key={range}
                onPress={() => onChange(range)}
                style={[styles.chip, value === range && styles.chipActive]}
              >
                <Text style={[styles.chipText, value === range && styles.chipTextActive]}>{range}</Text>
              </Pressable>
            ))}
          </View>
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

      <Button title="Get Started" onPress={handleSubmit(submit)} loading={loading} />
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    title: { ...t.typography.display, color: t.colors.text },
    subtitle: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginBottom: 24 },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: t.colors.text, marginBottom: 8, marginTop: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipText: { fontSize: 13, color: t.colors.text },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
  });
}
