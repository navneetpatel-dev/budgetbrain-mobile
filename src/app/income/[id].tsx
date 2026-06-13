import { useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, DateInput, ScreenLoader, useScrollContentStyle } from '@/shared/components/ui';
import { useIncomeDetail, type IncomeForm } from '@/features/income/hooks/useIncomeDetail';
import { useTheme } from '@/shared/theme';

export default function IncomeEditScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { income, isLoading, loading, save, populateForm, confirmDelete } = useIncomeDetail(id);

  const { control, handleSubmit, reset } = useForm<IncomeForm>({
    defaultValues: { amount: '', notes: '', date: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  if (isLoading || !income) {
    return <ScreenLoader />;
  }

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Controller control={control} name="amount" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Controller control={control} name="date" render={({ field: { onChange, value } }) => (
        <DateInput label="Date" value={value} onChange={onChange} />
      )} />
      <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
        <Input label="Notes" value={value} onChangeText={onChange} />
      )} />
      <Button title="Save" onPress={handleSubmit(save)} loading={loading} />
      <View style={styles.spacer} />
      <Button title="Delete" onPress={confirmDelete} variant="danger" loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    spacer: { height: 12 },
  });
}
