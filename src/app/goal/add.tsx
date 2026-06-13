import { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, DateInput, useScrollContentStyle, FormFieldLabel, OptionChips } from '@/shared/components/ui';
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
    <ScrollView style={styles.container} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Goal Name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="goals" />
        )}
      />

      <FormFieldLabel>Goal Type</FormFieldLabel>
      <OptionChips
        options={GOAL_TYPES.map((t) => t.value)}
        value={goalType}
        onChange={(v) => setValue('type', v)}
        getLabel={(v) => GOAL_TYPES.find((t) => t.value === v)?.label ?? v}
      />

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

      <Button title="Create Goal" onPress={handleSubmit(create)} loading={loading} size="lg" />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
  });
}
