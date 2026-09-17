import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
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
  FormErrorBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useCreateIncome, type IncomeForm } from '@/features/income/hooks/useCreateIncome';
import { INCOME_SOURCE_TYPES } from '@/shared/constants/config';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { useTheme } from '@/shared/theme';
import type { IncomeSource } from '@/shared/types';
import { DateBounds } from '@/shared/utils/dateBounds';
import {
  amountRules,
  dateRules,
  maxLen,
  optionalTextRules,
  textRules,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';

type SourceMode = 'existing' | 'new';

export default function AddIncomeScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError, justSaved } = useCreateIncome();
  const disabled = loading || justSaved;
  const [sourceMode, setSourceMode] = useState<SourceMode>('new');
  const modeInitialized = useRef(false);

  const { data: sources, isLoading: sourcesLoading } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources'],
    url: '/income/sources',
    itemsKey: 'sources',
  });
  const hasSources = sources.length > 0;

  useEffect(() => {
    if (modeInitialized.current || sourcesLoading) return;
    modeInitialized.current = true;
    if (hasSources) setSourceMode('existing');
  }, [sourcesLoading, hasSources]);

  const { control, handleSubmit, setValue, watch, clearErrors, setError, formState: { errors } } = useForm<IncomeForm>({
    defaultValues: {
      amount: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      incomeSourceId: '',
      newSourceName: '',
      newSourceType: 'salary',
    },
  });

  const newSourceType = watch('newSourceType');
  const isNewSource = sourceMode === 'new';
  const emptySourcesMessage = 'No income sources yet. Switch to New source to create one.';

  const onSubmit = async (data: IncomeForm) => {
    if (!isNewSource && !hasSources) {
      setError('incomeSourceId', { type: 'required', message: emptySourcesMessage });
      return;
    }
    await create(data, isNewSource);
  };

  return (
    <FormStackScreen eyebrow="Income" title="Add Income" subtitle="Record a new income entry">
      {justSaved ? <FormSuccessBanner message="Income saved" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Amount & date" subtitle="How much and when you received it">
        <Controller
          control={control}
          name="amount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input
              label={amountLabel('Amount')}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={errors.amount?.message}
              leftIcon="income"
              placeholder="0.00"
              disabled={disabled}
            />
          )}
        />

        <Controller
          control={control}
          name="date"
          rules={dateRules()}
          render={({ field: { onChange, value } }) => {
            const b = DateBounds.transaction(value);
            return (
              <DateInput
                label="Date"
                value={value}
                onChange={onChange}
                error={errors.date?.message}
                disabled={disabled}
                minimumDate={b.minimumDate}
                maximumDate={b.maximumDate}
              />
            );
          }}
        />
      </FormSection>

      <FormSection title="Income source" subtitle="Link to an existing source or create one">
        <FormFieldLabel>Source</FormFieldLabel>
        <OptionChips
          options={['existing', 'new'] as const}
          value={sourceMode}
          onChange={(v) => {
            setSourceMode(v);
            clearErrors(['incomeSourceId', 'newSourceName']);
          }}
          getLabel={(v) => (v === 'existing' ? 'Existing source' : 'New source')}
          disabled={disabled}
        />

        {!isNewSource ? (
          hasSources ? (
            <Controller
              control={control}
              name="incomeSourceId"
              shouldUnregister
              rules={{ required: ValidationMessages.incomeSourceRequired }}
              render={({ field: { onChange, value } }) => (
                <OptionChipList
                  items={(sources ?? []).map((src) => ({ id: src.id, label: src.name }))}
                  selectedId={value}
                  onSelect={onChange}
                  error={errors.incomeSourceId?.message}
                  disabled={disabled}
                />
              )}
            />
          ) : (
            <Text
              style={{
                ...theme.typography.caption,
                color: errors.incomeSourceId ? theme.colors.danger : theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              {errors.incomeSourceId?.message ?? emptySourcesMessage}
            </Text>
          )
        ) : (
          <>
            <Controller
              control={control}
              name="newSourceName"
              shouldUnregister
              rules={textRules('entityName')}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Source name"
                  value={value}
                  onChangeText={onChange}
                  maxLength={maxLen('entityName')}
                  placeholder="e.g. Salary, Freelance"
                  error={errors.newSourceName?.message}
                  leftIcon="wallet"
                  disabled={disabled}
                />
              )}
            />
            <FormFieldLabel>Source type</FormFieldLabel>
            <OptionChips
              options={INCOME_SOURCE_TYPES.map((t) => t.value)}
              value={newSourceType}
              onChange={(v) => setValue('newSourceType', v)}
              getLabel={(v) => INCOME_SOURCE_TYPES.find((t) => t.value === v)?.label ?? v}
              disabled={disabled}
            />
          </>
        )}
      </FormSection>

      <FormSection title="Notes" subtitle="Optional details">
        <Controller
          control={control}
          name="notes"
          rules={optionalTextRules('notes')}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Notes"
              maxLength={maxLen('notes')}
              value={value}
              onChangeText={onChange}
              placeholder="Add any extra details..."
              multiline
              disabled={disabled}
              error={errors.notes?.message}
            />
          )}
        />
      </FormSection>

      <FormActions
        primaryTitle="Save Income"
        onPrimary={handleSubmit(onSubmit)}
        primaryLoading={loading}
      />
    </FormStackScreen>
  );
}
