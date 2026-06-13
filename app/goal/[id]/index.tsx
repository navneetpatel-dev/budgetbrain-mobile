import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, ScreenLoader } from '@/src/components/ui';
import { apiGet, apiPatch, apiDelete } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { Goal } from '@/src/types';

interface GoalForm {
  name: string;
  targetAmount: string;
  targetDate: string;
}

export default function GoalEditScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: goal, isLoading } = useQuery({
    queryKey: ['goal', id],
    queryFn: async () => {
      const goals = await apiGet<Goal[]>('/goals');
      const found = goals.find((g) => g.id === id);
      if (!found) throw new Error('Goal not found');
      return found;
    },
    enabled: !!id,
  });

  const { control, handleSubmit, reset } = useForm<GoalForm>({
    defaultValues: { name: '', targetAmount: '', targetDate: '' },
  });

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        targetAmount: String(goal.targetAmount),
        targetDate: goal.targetDate ?? '',
      });
    }
  }, [goal, reset]);

  const onSave = async (data: GoalForm) => {
    setLoading(true);
    try {
      await apiPatch(`/goals/${id}`, {
        name: data.name,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not update goal');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Delete Goal', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await apiDelete(`/goals/${id}`);
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            router.back();
          } catch {
            Alert.alert('Error', 'Could not delete goal');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (isLoading || !goal) {
    return <ScreenLoader />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="name" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Name" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="targetAmount" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Target Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Controller control={control} name="targetDate" render={({ field: { onChange, value } }) => (
        <Input label="Target Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
      )} />
      <Button title="Save" onPress={handleSubmit(onSave)} loading={loading} />
      <View style={styles.spacer} />
      <Button title="Delete Goal" onPress={onDelete} variant="danger" loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: 16 },
    spacer: { height: 12 },
  });
}
