import { Controller, useForm } from 'react-hook-form';
import {
  Input,
  FormStackScreen,
  FormFieldLabel,
  OptionChips,
  MultiOptionChips,
  FormSection,
  FormActions,
  FormErrorBanner,
} from '@/shared/components/ui';
import { useOnboarding, type OnboardingForm } from '@/features/onboarding/hooks/useOnboarding';
import { SUPPORTED_CURRENCIES, FINANCIAL_GOALS, SALARY_RANGES } from '@/shared/constants/config';
import { getCurrencySymbol } from '@/shared/utils/currency';
import { amountRules, maxLen, textRules, ValidationMessages } from '@/shared/validation/fieldLimits';

export default function OnboardingScreen() {
  const { loading, submit, submitError } = useOnboarding();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<OnboardingForm>({
    defaultValues: {
      name: '',
      country: 'India',
      currency: 'INR',
      financialGoals: [],
      salaryRange: '',
      monthlySavingsTarget: '',
    },
  });

  const selectedCurrency = watch('currency');

  return (
    <FormStackScreen eyebrow="Welcome" title="Personalize" subtitle="Tell us a bit about yourself">
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="About you">
        <Controller
          control={control}
          name="name"
          rules={textRules('name')}
          render={({ field: { onChange, value } }) => (
            <Input label="Your name" value={value} onChangeText={onChange} maxLength={maxLen('name')} error={errors.name?.message} leftIcon="personFill" placeholder="What should we call you?" disabled={loading} />
          )}
        />

        <Controller
          control={control}
          name="country"
          rules={textRules('country')}
          render={({ field: { onChange, value } }) => (
            <Input label="Country" maxLength={maxLen('country')} value={value} onChangeText={onChange} error={errors.country?.message} disabled={loading} />
          )}
        />

        <FormFieldLabel>Currency</FormFieldLabel>
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, value } }) => (
            <OptionChips options={[...SUPPORTED_CURRENCIES]} value={value} onChange={onChange} disabled={loading} />
          )}
        />
      </FormSection>

      <FormSection title="Financial goals" subtitle="Select all that apply">
        <Controller
          control={control}
          name="financialGoals"
          rules={{
            validate: (value) =>
              (Array.isArray(value) && value.length > 0) || ValidationMessages.financialGoalsMin,
          }}
          render={({ field: { onChange, value } }) => (
            <MultiOptionChips
              options={[...FINANCIAL_GOALS]}
              selected={value}
              onToggle={(goal) => {
                const updated = value.includes(goal)
                  ? value.filter((g) => g !== goal)
                  : [...value, goal];
                onChange(updated);
              }}
              error={errors.financialGoals?.message}
              disabled={loading}
            />
          )}
        />
      </FormSection>

      <FormSection title="Income & savings">
        <FormFieldLabel>Salary range</FormFieldLabel>
        <Controller
          control={control}
          name="salaryRange"
          rules={{ required: 'Please select a salary range' }}
          render={({ field: { onChange, value } }) => (
            <OptionChips
              options={[...SALARY_RANGES]}
              value={value}
              onChange={onChange}
              error={errors.salaryRange?.message}
              disabled={loading}
            />
          )}
        />

        <Controller
          control={control}
          name="monthlySavingsTarget"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input
              label={`Monthly savings target (${getCurrencySymbol(selectedCurrency).trim()})`}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={errors.monthlySavingsTarget?.message}
              leftIcon="goals"
              placeholder="0"
              disabled={loading}
            />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Get Started" onPrimary={handleSubmit(submit)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
