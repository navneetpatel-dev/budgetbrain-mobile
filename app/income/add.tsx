import { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/src/components/ui';
import { apiGet, apiPost } from '@/src/services/api';
import { COLORS, INCOME_SOURCE_TYPES } from '@/src/constants/config';
import type { IncomeSource, Transaction } from '@/src/types';

interface IncomeForm {
  amount: string;
  notes: string;
  date: string;
  incomeSourceId: string;
  newSourceName: string;
  newSourceType: string;
}

export default function AddIncomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showNewSource, setShowNewSource] = useState(false);

  const { data: sources } = useQuery({
    queryKey: ['income-sources'],
    queryFn: () => apiGet<IncomeSource[]>('/income/sources'),
  });

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<IncomeForm>({
    defaultValues: {
      amount: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      incomeSourceId: '',
      newSourceName: '',
      newSourceType: 'salary',
    },
  });

  const selectedSource = watch('incomeSourceId');
  const newSourceType = watch('newSourceType');

  const onSubmit = async (data: IncomeForm) => {
    setLoading(true);
    try {
      let incomeSourceId = data.incomeSourceId;

      if (showNewSource && data.newSourceName) {
        const source = await apiPost<IncomeSource>('/income/sources', {
          name: data.newSourceName,
          type: data.newSourceType,
        });
        incomeSourceId = source.id;
        queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      }

      await apiPost<Transaction>('/income', {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
        incomeSourceId: incomeSourceId || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save income');
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
          <Input label="Amount (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="date"
        rules={{ required: 'Date is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} error={errors.date?.message} />
        )}
      />

      <Text style={styles.label}>Income Source</Text>
      {!showNewSource ? (
        <>
          <View style={styles.chipRow}>
            {sources?.map((src) => (
              <Pressable
                key={src.id}
                onPress={() => setValue('incomeSourceId', src.id)}
                style={[styles.chip, selectedSource === src.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedSource === src.id && styles.chipTextActive]}>{src.name}</Text>
              </Pressable>
            ))}
          </View>
          <Button title="Add New Source" onPress={() => setShowNewSource(true)} variant="outline" />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="newSourceName"
            rules={{ required: showNewSource ? 'Source name is required' : false }}
            render={({ field: { onChange, value } }) => (
              <Input label="Source Name" value={value} onChangeText={onChange} placeholder="e.g. Salary, Freelance" error={errors.newSourceName?.message} />
            )}
          />
          <Text style={styles.label}>Source Type</Text>
          <View style={styles.chipRow}>
            {INCOME_SOURCE_TYPES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setValue('newSourceType', t.value)}
                style={[styles.chip, newSourceType === t.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, newSourceType === t.value && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <Button title="Use Existing Source" onPress={() => setShowNewSource(false)} variant="outline" />
        </>
      )}

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <Input label="Notes" value={value} onChangeText={onChange} placeholder="Optional notes" />
        )}
      />

      <Button title="Save Income" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  chipActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
