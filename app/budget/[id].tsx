import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, ScreenLoader } from '@/src/components/ui';
import { apiGet, apiPatch } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { Budget } from '@/src/types';

interface BudgetForm {
  name: string;
  amount: string;
  alertThreshold: string;
}

export default function BudgetEditScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      const budgets = await apiGet<Budget[]>('/budgets');
      const found = budgets.find((b) => b.id === id);
      if (!found) throw new Error('Budget not found');
      return found;
    },
    enabled: !!id,
  });

  const { control, handleSubmit, reset } = useForm<BudgetForm>({
    defaultValues: { name: '', amount: '', alertThreshold: '80' },
  });

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        amount: String(budget.amount),
        alertThreshold: String(budget.alertThreshold),
      });
    }
  }, [budget, reset]);

  const onSave = async (data: BudgetForm) => {
    setLoading(true);
    try {
      await apiPatch(`/budgets/${id}`, {
        name: data.name,
        amount: Number(data.amount),
        alertThreshold: Number(data.alertThreshold),
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not update budget');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !budget) {
    return <ScreenLoader />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="name" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Name" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="amount" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Controller control={control} name="alertThreshold" render={({ field: { onChange, value } }) => (
        <Input label="Alert Threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Button title="Save" onPress={handleSubmit(onSave)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: 16 },
  });
}
