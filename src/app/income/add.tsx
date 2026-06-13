import { useState, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Input,
  DateInput,
  useScrollContentStyle,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
} from '@/shared/components/ui';
import { apiGet } from '@/shared/services/api';
import { useCreateIncome, type IncomeForm } from '@/features/income/hooks/useCreateIncome';
import { INCOME_SOURCE_TYPES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import type { IncomeSource } from '@/shared/types';

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
    <ScrollView style={styles.container} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="income" />
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

      <FormFieldLabel>Income Source</FormFieldLabel>
      {!showNewSource ? (
        <>
          <OptionChipList
            items={(sources ?? []).map((src) => ({ id: src.id, label: src.name }))}
            selectedId={selectedSource}
            onSelect={(id) => setValue('incomeSourceId', id)}
          />
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
          <FormFieldLabel>Source Type</FormFieldLabel>
          <OptionChips
            options={INCOME_SOURCE_TYPES.map((t) => t.value)}
            value={newSourceType}
            onChange={(v) => setValue('newSourceType', v)}
            getLabel={(v) => INCOME_SOURCE_TYPES.find((t) => t.value === v)?.label ?? v}
          />
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

      <Button title="Save Income" onPress={handleSubmit((data) => create(data, showNewSource))} loading={loading} size="lg" />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
  });
}
