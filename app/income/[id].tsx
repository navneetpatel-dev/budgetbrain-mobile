import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, ScreenLoader } from '@/src/components/ui';
import { apiGet, apiPatch, apiDelete } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { Transaction } from '@/src/types';

interface IncomeForm {
  amount: string;
  notes: string;
  date: string;
}

export default function IncomeEditScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: income, isLoading } = useQuery({
    queryKey: ['income', id],
    queryFn: async () => {
      const result = await apiGet<{ transactions: Transaction[] }>('/income', { limit: 200 });
      const found = result.transactions.find((t) => t.id === id);
      if (!found) throw new Error('Income not found');
      return found;
    },
    enabled: !!id,
  });

  const { control, handleSubmit, reset } = useForm<IncomeForm>({
    defaultValues: { amount: '', notes: '', date: '' },
  });

  useEffect(() => {
    if (income) {
      reset({ amount: String(income.amount), notes: income.notes ?? '', date: income.date });
    }
  }, [income, reset]);

  const onSave = async (data: IncomeForm) => {
    setLoading(true);
    try {
      await apiPatch(`/income/${id}`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
      });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not update income');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Delete Income', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await apiDelete(`/income/${id}`);
            queryClient.invalidateQueries({ queryKey: ['income'] });
            router.back();
          } catch {
            Alert.alert('Error', 'Could not delete income');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (isLoading || !income) {
    return <ScreenLoader />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="amount" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <Input label="Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />
      <Controller control={control} name="date" render={({ field: { onChange, value } }) => (
        <Input label="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
        <Input label="Notes" value={value} onChangeText={onChange} />
      )} />
      <Button title="Save" onPress={handleSubmit(onSave)} loading={loading} />
      <View style={styles.spacer} />
      <Button title="Delete" onPress={onDelete} variant="danger" loading={loading} />
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
