import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, DateInput, useScrollContentStyle } from '@/shared/components/ui';
import { useCreateGoal, type GoalForm } from '@/features/goals/hooks/useCreateGoal';
import { GOAL_TYPES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';

export default function AddGoalScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { create, loading } = useCreateGoal();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<GoalForm>({
    defaultValues: { name: '', type: 'emergency_fund', targetAmount: '', targetDate: '' },
  });

  const goalType = watch('type');

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Goal Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />

      <Text style={styles.label}>Goal Type</Text>
      <View style={styles.chipRow}>
        {GOAL_TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setValue('type', t.value)}
            style={[styles.chip, goalType === t.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, goalType === t.value && styles.chipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Controller
        control={control}
        name="targetAmount"
        rules={{ required: 'Target amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Target Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.targetAmount?.message} />
        )}
      />

      <Controller
        control={control}
        name="targetDate"
        render={({ field: { onChange, value } }) => (
          <DateInput label="Target Date (optional)" value={value} onChange={onChange} />
        )}
      />

      <Button title="Create Goal" onPress={handleSubmit(create)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipText: { fontSize: 13, color: t.colors.text },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
  });
}
