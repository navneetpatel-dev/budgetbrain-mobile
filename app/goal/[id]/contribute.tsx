import { useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, useScrollContentStyle } from '@/src/shared/components/ui';
import { useContributeGoal, type ContributeForm } from '@/src/features/goals/hooks/useContributeGoal';
import { useTheme } from '@/src/shared/theme';
import { useUserCurrency } from '@/src/shared/hooks/useUserCurrency';

export default function ContributeGoalScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contribute, loading } = useContributeGoal(id);

  const { control, handleSubmit, formState: { errors } } = useForm<ContributeForm>({
    defaultValues: { amount: '', notes: '' },
  });

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
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
      <Button title="Add Contribution" onPress={handleSubmit(contribute)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
  });
}
