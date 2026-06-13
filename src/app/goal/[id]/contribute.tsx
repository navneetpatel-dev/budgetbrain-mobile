import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  FormStackScreen,
  FormSection,
  FormActions,
} from '@/shared/components/ui';
import { useContributeGoal, type ContributeForm } from '@/features/goals/hooks/useContributeGoal';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';

export default function ContributeGoalScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contribute, loading } = useContributeGoal(id);

  const { control, handleSubmit, formState: { errors } } = useForm<ContributeForm>({
    defaultValues: { amount: '', notes: '' },
  });

  return (
    <FormStackScreen eyebrow="GOAL" title="Contribute" subtitle="Add to your goal">
      <FormSection title="Contribution" subtitle="How much are you adding?">
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
              leftIcon="goals"
              placeholder="0.00"
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input label="Notes" value={value} onChangeText={onChange} placeholder="Optional note..." multiline />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Add Contribution" onPrimary={handleSubmit(contribute)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
