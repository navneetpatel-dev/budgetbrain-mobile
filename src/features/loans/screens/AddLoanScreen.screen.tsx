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
  FormSuccessBanner,
} from '@/shared/components/ui';
import { useCreateLoan, type LoanForm } from '@/features/loans/hooks/useCreateLoan';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { amountRules, dateRules, maxLen, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

const LOAN_TYPES = [
  { value: 'loan', label: 'Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'emi', label: 'EMI' },
  { value: 'other', label: 'Other' },
] as const;

export function AddLoanScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError, justSaved } = useCreateLoan();
  const disabled = loading || justSaved;

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<LoanForm>({
    defaultValues: {
      name: '',
      type: 'loan',
      principal: '',
      interestRate: '',
      emiAmount: '',
      startDate: toIsoDate(new Date()),
      dueDayOfMonth: '',
      notes: '',
    },
  });

  const loanType = watch('type');

  return (
    <FormStackScreen eyebrow="Loan" title="Add Loan" subtitle="Track a debt or repayment">
      {justSaved ? <FormSuccessBanner message="Loan added" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Loan details" subtitle="What are you paying off?">
        <Controller
          control={control}
          name="name"
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Loan name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="wallet" placeholder="e.g. Car loan" disabled={disabled} />
          )}
        />

        <FormFieldLabel>Type</FormFieldLabel>
        <OptionChips
          options={LOAN_TYPES.map((t) => t.value)}
          value={loanType}
          onChange={(v) => setValue('type', v)}
          getLabel={(v) => LOAN_TYPES.find((t) => t.value === v)?.label ?? v}
          disabled={disabled}
        />

        <Controller
          control={control}
          name="principal"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Principal amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.principal?.message} leftIcon="wallet" placeholder="0.00" disabled={disabled} />
          )}
        />
      </FormSection>

      <FormSection title="Terms" subtitle="Optional details">
        <Controller
          control={control}
          name="interestRate"
          render={({ field: { onChange, value } }) => (
            <Input label="Interest rate (%)" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="e.g. 9.5" disabled={disabled} />
          )}
        />
        <Controller
          control={control}
          name="emiAmount"
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Monthly EMI')} value={value} onChangeText={onChange} keyboardType="numeric" placeholder="0.00" disabled={disabled} />
          )}
        />
        <Controller
          control={control}
          name="startDate"
          rules={dateRules('investmentPurchase')}
          render={({ field: { onChange, value } }) => {
            const b = DateBounds.investmentPurchase(value);
            return (
              <DateInput
                label="Start date"
                value={value}
                onChange={onChange}
                error={errors.startDate?.message}
                disabled={disabled}
                minimumDate={b.minimumDate}
                maximumDate={b.maximumDate}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="dueDayOfMonth"
          render={({ field: { onChange, value } }) => (
            <Input label="Due day of month" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="e.g. 5" helperText="Day of the month payment is due (1-31)" disabled={disabled} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          rules={optionalTextRules('notes')}
          render={({ field: { onChange, value } }) => (
            <Input label="Notes" value={value} onChangeText={onChange} maxLength={maxLen('notes')} multiline placeholder="Optional note..." disabled={disabled} />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Add Loan" onPrimary={handleSubmit(create)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
