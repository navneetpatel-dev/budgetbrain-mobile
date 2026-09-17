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
import { usePayLoan, type PayLoanForm } from '@/features/loans/hooks/usePayLoan';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { amountRules, maxLen, optionalTextRules } from '@/shared/validation/fieldLimits';

export default function PayLoanScreen() {
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = useStackBack(`/loan/${id}` as Href);
  const { pay, loading, submitError, justSaved } = usePayLoan(id);
  const disabled = loading || justSaved;

  const { control, handleSubmit, formState: { errors } } = useForm<PayLoanForm>({
    defaultValues: { amount: '', notes: '' },
  });

  return (
    <FormStackScreen eyebrow="Loan" title="Record Payment" subtitle="Reduce your remaining balance" onBack={goBack}>
      {justSaved ? <FormSuccessBanner message="Payment recorded" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Payment" subtitle="How much did you pay?">
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
              leftIcon="wallet"
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

      <FormActions primaryTitle="Record Payment" onPrimary={handleSubmit(pay)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
