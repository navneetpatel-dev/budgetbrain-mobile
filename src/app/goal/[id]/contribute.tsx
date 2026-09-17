import { useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  FormStackScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
  FormSuccessBanner,
  useStackBack,
} from '@/shared/components/ui';
import { useContributeGoal, type ContributeForm } from '@/features/goals/hooks/useContributeGoal';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { amountRules, maxLen, optionalTextRules } from '@/shared/validation/fieldLimits';

export default function ContributeGoalScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = useStackBack(`/goal/${id}` as Href);
  const { contribute, loading, submitError, justSaved } = useContributeGoal(id);
  const disabled = loading || justSaved;

  const { control, handleSubmit, formState: { errors } } = useForm<ContributeForm>({
    defaultValues: { amount: '', notes: '' },
  });

  return (
    <FormStackScreen eyebrow="Goal" title="Contribute" subtitle="Add to your goal" onBack={goBack}>
      {justSaved ? <FormSuccessBanner message="Contribution added" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Contribution" subtitle="How much are you adding?">
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
              leftIcon="goals"
              placeholder="0.00"
              disabled={disabled}
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          rules={optionalTextRules('notes')}
          render={({ field: { onChange, value } }) => (
            <Input label="Notes" maxLength={maxLen('notes')} value={value} onChangeText={onChange} placeholder="Optional note..." multiline disabled={disabled} error={errors.notes?.message} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Add Contribution" onPrimary={handleSubmit(contribute)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
