import { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { COLORS, GOAL_TYPES } from '@/src/constants/config';
import type { Goal } from '@/src/types';

interface GoalForm {
  name: string;
  type: string;
  targetAmount: string;
  targetDate: string;
}

export default function AddGoalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<GoalForm>({
    defaultValues: { name: '', type: 'emergency_fund', targetAmount: '', targetDate: '' },
  });

  const goalType = watch('type');

  const onSubmit = async (data: GoalForm) => {
    setLoading(true);
    try {
      await apiPost<Goal>('/goals', {
        name: data.name,
        type: data.type,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Goal Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />

      <Text style={styles.label}>Goal Type</Text>
      <View style={styles.chipRow}>
        {GOAL_TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setValue('type', t.value)}
            style={[styles.chip, goalType === t.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, goalType === t.value && styles.chipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Controller
        control={control}
        name="targetAmount"
        rules={{ required: 'Target amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Target Amount (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.targetAmount?.message} />
        )}
      />

      <Controller
        control={control}
        name="targetDate"
        render={({ field: { onChange, value } }) => (
          <Input label="Target Date (YYYY-MM-DD, optional)" value={value} onChangeText={onChange} />
        )}
      />

      <Button title="Create Goal" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
