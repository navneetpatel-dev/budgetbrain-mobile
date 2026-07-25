import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  DateInput,
  DetailSkeleton,
  FormStackScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
} from '@/shared/components/ui';
import { useIncomeDetail, type IncomeForm } from '@/features/income/hooks/useIncomeDetail';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { amountRules, dateRules, maxLen, optionalTextRules } from '@/shared/validation/fieldLimits';

export default function IncomeEditScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { income, isLoading, loading, save, populateForm, confirmDelete, submitError } = useIncomeDetail(id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IncomeForm>({
    defaultValues: { amount: '', notes: '', date: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  if (isLoading || !income) {
    return <DetailSkeleton />;
  }

  return (
    <FormStackScreen eyebrow="INCOME" title="Edit Income" subtitle="Update income entry">
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Income details">
        <Controller
          control={control}
          name="amount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="income" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="date"
          rules={dateRules()}
          render={({ field: { onChange, value } }) => (
            <DateInput label="Date" value={value} onChange={onChange} error={errors.date?.message} disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          rules={optionalTextRules('notes')}
          render={({ field: { onChange, value } }) => (
            <Input label="Notes" maxLength={maxLen('notes')} value={value} onChangeText={onChange} placeholder="Optional notes" multiline disabled={loading} error={errors.notes?.message} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Changes" onPrimary={handleSubmit(save)} primaryLoading={loading} />
      <Button title="Delete Income" onPress={confirmDelete} variant="danger" loading={loading} />
    </FormStackScreen>
  );
}
