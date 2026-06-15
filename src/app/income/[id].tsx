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
  ScreenLoader,
} from '@/shared/components/ui';
import { useIncomeDetail, type IncomeForm } from '@/features/income/hooks/useIncomeDetail';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';

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
    return <ScreenLoader />;
  }

  return (
    <FormStackScreen eyebrow="INCOME" title="Edit Income" subtitle="Update income entry">
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Income details">
        <Controller
          control={control}
          name="amount"
          rules={{ required: 'Amount is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="income" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <DateInput label="Date" value={value} onChange={onChange} disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input label="Notes" value={value} onChangeText={onChange} placeholder="Optional notes" multiline disabled={loading} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Changes" onPrimary={handleSubmit(save)} primaryLoading={loading} />
      <Button title="Delete Income" onPress={confirmDelete} variant="danger" loading={loading} />
    </FormStackScreen>
  );
}
