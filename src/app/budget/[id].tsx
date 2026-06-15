import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  ScreenLoader,
  FormStackScreen,
  FormSection,
  FormActions,
} from '@/shared/components/ui';
import { useBudgetDetail, type BudgetForm } from '@/features/budgets/hooks/useBudgetDetail';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';

export default function BudgetEditScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { budget, isLoading, loading, save, populateForm } = useBudgetDetail(id);

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
      <FormSection title="Budget details">
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Budget name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" />
          )}
        />
        <Controller
          control={control}
          name="amount"
          rules={{ required: 'Amount is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" />
          )}
        />
        <Controller
          control={control}
          name="alertThreshold"
          render={({ field: { onChange, value } }) => (
            <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Changes" onPrimary={handleSubmit(save)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
