import { Controller, useForm } from 'react-hook-form';
import {
  Input,
  DateInput,
  FormFieldLabel,
  OptionChips,
  FormStackScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
} from '@/shared/components/ui';
import { useCreateGoal, type GoalForm } from '@/features/goals/hooks/useCreateGoal';
import { GOAL_TYPES } from '@/shared/constants/config';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { amountRules, maxLen, optionalDateRules, textRules } from '@/shared/validation/fieldLimits';

export default function AddGoalScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError } = useCreateGoal();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<GoalForm>({
    defaultValues: { name: '', type: 'emergency_fund', targetAmount: '', targetDate: '' },
  });

  const goalType = watch('type');

  return (
    <FormStackScreen eyebrow="Goal" title="Create Goal" subtitle="Set a savings target">
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Goal details" subtitle="What are you saving for?">
        <Controller
          control={control}
          name="name"
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Goal name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="goals" placeholder="e.g. Emergency fund" disabled={loading} />
          )}
        />

        <FormFieldLabel>Goal type</FormFieldLabel>
        <OptionChips
          options={GOAL_TYPES.map((t) => t.value)}
          value={goalType}
          onChange={(v) => setValue('type', v)}
          getLabel={(v) => GOAL_TYPES.find((t) => t.value === v)?.label ?? v}
          disabled={loading}
        />

        <Controller
          control={control}
          name="targetAmount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Target amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.targetAmount?.message} leftIcon="wallet" placeholder="0.00" disabled={loading} />
          )}
        />
      </FormSection>

      <FormSection title="Timeline" subtitle="Optional target date">
        <Controller
          control={control}
          name="targetDate"
          rules={optionalDateRules()}
          render={({ field: { onChange, value } }) => (
            <DateInput label="Target date" value={value} onChange={onChange} error={errors.targetDate?.message} disabled={loading} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Create Goal" onPrimary={handleSubmit(create)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
