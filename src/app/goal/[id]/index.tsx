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
import { useGoalDetail, type GoalForm } from '@/features/goals/hooks/useGoalDetail';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';

export default function GoalEditScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goal, isLoading, loading, save, populateForm, confirmDelete, submitError } = useGoalDetail(id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GoalForm>({
    defaultValues: { name: '', targetAmount: '', targetDate: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  if (isLoading || !goal) {
    return <DetailSkeleton />;
  }

  return (
    <FormStackScreen eyebrow="GOAL" title="Edit Goal" subtitle={goal.name}>
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Goal details">
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Goal name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="goals" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="targetAmount"
          rules={{ required: 'Target amount is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Target amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.targetAmount?.message} leftIcon="wallet" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="targetDate"
          render={({ field: { onChange, value } }) => (
            <DateInput label="Target date" value={value} onChange={onChange} disabled={loading} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Changes" onPrimary={handleSubmit(save)} primaryLoading={loading} />
      <Button title="Delete Goal" onPress={confirmDelete} variant="danger" loading={loading} />
    </FormStackScreen>
  );
}
