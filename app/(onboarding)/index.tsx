import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { setUser } from '@/src/store/authSlice';
import { useAppDispatch } from '@/src/store/hooks';
import { SUPPORTED_CURRENCIES, FINANCIAL_GOALS, SALARY_RANGES } from '@/src/constants/config';
import { useTheme } from '@/src/theme';
import type { User } from '@/src/types';

interface OnboardingForm {
  name: string;
  country: string;
  currency: string;
  financialGoals: string[];
  salaryRange: string;
  monthlySavingsTarget: string;
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<OnboardingForm>({
    defaultValues: {
      name: '',
      country: 'India',
      currency: 'INR',
      financialGoals: [],
      salaryRange: '',
      monthlySavingsTarget: '',
    },
  });

  const toggleGoal = (goal: string) => {
    const updated = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(updated);
    setValue('financialGoals', updated);
  };

  const onSubmit = async (data: OnboardingForm) => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
      <View style={styles.chipRow}>
        {SUPPORTED_CURRENCIES.map((c) => (
          <Controller
            key={c}
            control={control}
            name="currency"
            render={({ field: { onChange, value } }) => (
              <Pressable
                onPress={() => onChange(c)}
                style={[styles.chip, value === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, value === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            )}
          />
        ))}
      </View>

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
      <View style={styles.chipRow}>
        {SALARY_RANGES.map((range) => (
          <Controller
            key={range}
            control={control}
            name="salaryRange"
            rules={{ required: 'Select salary range' }}
            render={({ field: { onChange, value } }) => (
              <Pressable
                onPress={() => onChange(range)}
                style={[styles.chip, value === range && styles.chipActive]}
              >
                <Text style={[styles.chipText, value === range && styles.chipTextActive]}>{range}</Text>
              </Pressable>
            )}
          />
        ))}
      </View>

      <Controller
        control={control}
        name="monthlySavingsTarget"
        rules={{ required: 'Savings target is required' }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Monthly Savings Target (₹)"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            error={errors.monthlySavingsTarget?.message}
          />
        )}
      />

      <Button title="Get Started" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: 24, paddingBottom: 48 },
    title: { fontSize: 28, fontWeight: '800', color: t.colors.text },
    subtitle: { fontSize: 16, color: t.colors.textSecondary, marginBottom: 24 },
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
