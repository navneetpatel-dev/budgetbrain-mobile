import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, FormStackScreen } from '@/shared/components/ui';
import { useContributeGoal, type ContributeForm } from '@/features/goals/hooks/useContributeGoal';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';

export default function ContributeGoalScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contribute, loading } = useContributeGoal(id);

  const { control, handleSubmit, formState: { errors } } = useForm<ContributeForm>({
    defaultValues: { amount: '', notes: '' },
  });

  return (
    <FormStackScreen eyebrow="GOAL" title="Contribute" subtitle="Add to your goal">
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Contribution Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <Input label="Notes (optional)" value={value} onChangeText={onChange} />
        )}
      />
      <Button title="Add Contribution" onPress={handleSubmit(contribute)} loading={loading} size="lg" />
    </FormStackScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({});
}
