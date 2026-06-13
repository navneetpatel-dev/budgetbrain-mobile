import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, ScreenLoader, FormStackScreen } from '@/shared/components/ui';
import { useBudgetDetail, type BudgetForm } from '@/features/budgets/hooks/useBudgetDetail';
import { useTheme } from '@/shared/theme';

export default function BudgetEditScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { budget, isLoading, loading, save, populateForm } = useBudgetDetail(id);

  const { control, handleSubmit, reset } = useForm<BudgetForm>({
    defaultValues: { name: '', amount: '', alertThreshold: '80' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [budget, reset, populateForm]);

  if (isLoading || !budget) {
    return <ScreenLoader />;
  }

  return (
    <FormStackScreen eyebrow="BUDGET" title="Edit Budget" subtitle={budget.name}>
      <Controller control={control} name="name" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Name" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="amount" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Controller control={control} name="alertThreshold" render={({ field: { onChange, value } }) => (
        <Input label="Alert Threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Button title="Save" onPress={handleSubmit(save)} loading={loading} size="lg" />
    </FormStackScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({});
}
