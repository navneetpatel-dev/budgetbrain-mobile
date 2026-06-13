import { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';

interface ContributeForm {
  amount: string;
  notes: string;
}

export default function ContributeGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ContributeForm>({
    defaultValues: { amount: '', notes: '' },
  });

  const onSubmit = async (data: ContributeForm) => {
    setLoading(true);
    try {
      await apiPost(`/goals/${id}/contribute`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not add contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Contribution Amount (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <Input label="Notes (optional)" value={value} onChangeText={onChange} />
        )}
      />
      <Button title="Add Contribution" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
});
