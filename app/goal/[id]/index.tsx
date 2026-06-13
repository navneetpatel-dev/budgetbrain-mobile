import { useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, DateInput, ScreenLoader, useScrollContentStyle } from '@/src/shared/components/ui';
import { useGoalDetail, type GoalForm } from '@/src/features/goals/hooks/useGoalDetail';
import { useTheme } from '@/src/shared/theme';

export default function GoalEditScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goal, isLoading, loading, save, populateForm, confirmDelete } = useGoalDetail(id);

  const { control, handleSubmit, reset } = useForm<GoalForm>({
    defaultValues: { name: '', targetAmount: '', targetDate: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  if (isLoading || !goal) {
    return <ScreenLoader />;
  }

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Controller control={control} name="name" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Name" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="targetAmount" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Target Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Controller control={control} name="targetDate" render={({ field: { onChange, value } }) => (
        <DateInput label="Target Date" value={value} onChange={onChange} />
      )} />
      <Button title="Save" onPress={handleSubmit(save)} loading={loading} />
      <View style={styles.spacer} />
      <Button title="Delete Goal" onPress={confirmDelete} variant="danger" loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    spacer: { height: 12 },
  });
}
