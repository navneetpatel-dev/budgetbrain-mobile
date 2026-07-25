import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  DetailSkeleton,
  FormStackScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
} from '@/shared/components/ui';
import { useBudgetDetail, type BudgetForm } from '@/features/budgets/hooks/useBudgetDetail';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { alertThresholdRules, amountRules, maxLen, textRules } from '@/shared/validation/fieldLimits';

export default function BudgetEditScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { budget, isLoading, loading, save, populateForm, submitError } = useBudgetDetail(id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BudgetForm>({
    defaultValues: { name: '', amount: '', alertThreshold: '80' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [budget, reset, populateForm]);

  if (isLoading || !budget) {
    return <DetailSkeleton />;
  }

  return (
    <FormStackScreen eyebrow="BUDGET" title="Edit Budget" subtitle={budget.name}>
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Budget details">
        <Controller
          control={control}
          name="name"
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Budget name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="amount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="alertThreshold"
          rules={alertThresholdRules()}
          render={({ field: { onChange, value } }) => (
            <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" disabled={loading} error={errors.alertThreshold?.message} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Changes" onPrimary={handleSubmit(save)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
