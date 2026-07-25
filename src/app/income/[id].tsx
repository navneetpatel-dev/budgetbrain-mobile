import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  DateInput,
  DetailSkeleton,
  FormStackScreen,
  FormSection,
  FormActions,
  DetailActions,
  DetailHero,
  DetailMetaList,
  FormErrorBanner,
} from '@/shared/components/ui';
import { useIncomeDetail, type IncomeForm } from '@/features/income/hooks/useIncomeDetail';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { amountRules, dateRules, maxLen, optionalTextRules } from '@/shared/validation/fieldLimits';

export default function IncomeDetailScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { income, isLoading, loading, save, populateForm, confirmDelete, submitError } = useIncomeDetail(id);
  const [editing, setEditing] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IncomeForm>({
    defaultValues: { amount: '', notes: '', date: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  if (isLoading || !income) {
    return (
      <FormStackScreen eyebrow="Income" title="Income" subtitle="Loading details">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  const title = income.merchant || 'Income';

  return (
    <FormStackScreen
      eyebrow="Income"
      title={editing ? 'Edit Income' : title}
      subtitle={editing ? 'Update income entry' : income.date}
    >
      {submitError ? <FormErrorBanner message={submitError} /> : null}

      {!editing ? (
        <>
          <DetailHero
            amount={`+${formatCurrency(Number(income.amount), income.currency)}`}
            amountColor={theme.colors.success}
            title={title}
            subtitle={income.date}
          />
          <DetailMetaList
            rows={[
              { label: 'Date', value: income.date },
              { label: 'Merchant', value: income.merchant ?? '' },
              { label: 'Notes', value: income.notes ?? '' },
            ]}
          />
          <DetailActions
            primaryTitle="Edit"
            onPrimary={() => {
              populateForm(reset);
              setEditing(true);
            }}
            onDestructive={confirmDelete}
            destructiveLoading={loading}
          />
        </>
      ) : (
        <>
          <FormSection title="Income details">
            <Controller
              control={control}
              name="amount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="income" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="date"
              rules={dateRules()}
              render={({ field: { onChange, value } }) => (
                <DateInput label="Date" value={value} onChange={onChange} error={errors.date?.message} disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="notes"
              rules={optionalTextRules('notes')}
              render={({ field: { onChange, value } }) => (
                <Input label="Notes" maxLength={maxLen('notes')} value={value} onChangeText={onChange} placeholder="Optional notes" multiline disabled={loading} error={errors.notes?.message} />
              )}
            />
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSubmit(save)}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </>
      )}
    </FormStackScreen>
  );
}
