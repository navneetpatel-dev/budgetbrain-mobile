import { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, DateInput, useScrollContentStyle } from '@/src/shared/components/ui';
import { apiGet } from '@/src/shared/services/api';
import { useCreateIncome, type IncomeForm } from '@/src/features/income/hooks/useCreateIncome';
import { INCOME_SOURCE_TYPES } from '@/src/shared/constants/config';
import { useTheme } from '@/src/shared/theme';
import { useUserCurrency } from '@/src/shared/hooks/useUserCurrency';
import type { IncomeSource } from '@/src/shared/types';

export default function AddIncomeScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { create, loading } = useCreateIncome();
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

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="date"
        rules={{ required: 'Date is required' }}
        render={({ field: { onChange, value } }) => (
          <DateInput label="Date" value={value} onChange={onChange} error={errors.date?.message} />
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

      <Button title="Save Income" onPress={handleSubmit((data) => create(data, showNewSource))} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    chipActive: { backgroundColor: t.colors.success, borderColor: t.colors.success },
    chipText: { fontSize: 13, color: t.colors.text },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
  });
}
