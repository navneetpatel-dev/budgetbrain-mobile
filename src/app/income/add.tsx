import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Input,
  DateInput,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  FormActions,
} from '@/shared/components/ui';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useCreateIncome, type IncomeForm } from '@/features/income/hooks/useCreateIncome';
import { INCOME_SOURCE_TYPES } from '@/shared/constants/config';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import type { IncomeSource } from '@/shared/types';

type SourceMode = 'existing' | 'new';

export default function AddIncomeScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading } = useCreateIncome();
  const [sourceMode, setSourceMode] = useState<SourceMode>('existing');

  const { data: sources } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources'],
    url: '/income/sources',
    itemsKey: 'sources',
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
  const isNewSource = sourceMode === 'new';

  return (
    <FormStackScreen eyebrow="INCOME" title="Add Income" subtitle="Record a new income entry">
      <FormSection title="Amount & date" subtitle="How much and when you received it">
        <Controller
          control={control}
          name="amount"
          rules={{ required: 'Amount is required' }}
          render={({ field: { onChange, value } }) => (
            <Input
              label={amountLabel('Amount')}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={errors.amount?.message}
              leftIcon="income"
              placeholder="0.00"
            />
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
      </FormSection>

      <FormSection title="Income source" subtitle="Link to an existing source or create one">
        <FormFieldLabel>Source</FormFieldLabel>
        <OptionChips
          options={['existing', 'new'] as const}
          value={sourceMode}
          onChange={(v) => setSourceMode(v)}
          getLabel={(v) => (v === 'existing' ? 'Existing source' : 'New source')}
        />

        {!isNewSource ? (
          <OptionChipList
            items={(sources ?? []).map((src) => ({ id: src.id, label: src.name }))}
            selectedId={selectedSource}
            onSelect={(id) => setValue('incomeSourceId', id)}
          />
        ) : (
          <>
            <Controller
              control={control}
              name="newSourceName"
              rules={{ required: isNewSource ? 'Source name is required' : false }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Source name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. Salary, Freelance"
                  error={errors.newSourceName?.message}
                  leftIcon="wallet"
                />
              )}
            />
            <FormFieldLabel>Source type</FormFieldLabel>
            <OptionChips
              options={INCOME_SOURCE_TYPES.map((t) => t.value)}
              value={newSourceType}
              onChange={(v) => setValue('newSourceType', v)}
              getLabel={(v) => INCOME_SOURCE_TYPES.find((t) => t.value === v)?.label ?? v}
            />
          </>
        )}
      </FormSection>

      <FormSection title="Notes" subtitle="Optional details">
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Notes"
              value={value}
              onChangeText={onChange}
              placeholder="Add any extra details..."
              multiline
            />
          )}
        />
      </FormSection>

      <FormActions
        primaryTitle="Save Income"
        onPrimary={handleSubmit((data) => create(data, isNewSource))}
        primaryLoading={loading}
      />
    </FormStackScreen>
  );
}
