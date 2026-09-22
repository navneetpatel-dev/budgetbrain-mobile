import { useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  DateInput,
  DetailSkeleton,
  EmptyState,
  FormStackScreen,
  FormSection,
  FormActions,
  DetailActions,
  DetailHero,
  DetailMetaList,
  FormErrorBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { useIncomeDetail, type IncomeForm } from '@/features/income/hooks/useIncomeDetail.hook';
import { IncomeAllocationSection } from '@/features/income/components/IncomeAllocationSection.component';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency.hook';
import { formatCurrency } from '@/shared/utils/currency';
import { amountRules, dateRules, maxLen, optionalTextRules } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

export function IncomeDetailScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    income,
    isLoading,
    isError,
    refetch,
    isRefetching,
    loading,
    updating,
    duplicating,
    deleting,
    save,
    duplicate,
    populateForm,
    confirmDelete,
    submitError,
  } = useIncomeDetail(id);
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IncomeForm>({
    defaultValues: { amount: '', notes: '', date: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  if (isLoading) {
    return (
      <FormStackScreen eyebrow="Income" title="Income" subtitle="Loading details">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !income) {
    return (
      <FormStackScreen eyebrow="Income" title="Income" subtitle="Unavailable">
        <EmptyState
          icon="income"
          title="Couldn’t load income"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const title = income.merchant || 'Income';

  return (
    <FormStackScreen
      eyebrow="Income"
      title={editing ? 'Edit Income' : title}
      subtitle={editing ? 'Update income entry' : income.date}
      refreshControl={
        editing ? undefined : <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {justSaved ? <FormSuccessBanner message="Income updated" /> : null}
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
            secondaryTitle="Duplicate"
            onSecondary={duplicate}
            secondaryLoading={duplicating}
            onDestructive={confirmDelete}
            destructiveLoading={deleting}
          />
          <IncomeAllocationSection
            transactionId={income.id}
            amount={Number(income.amount)}
            currency={income.currency}
            existingAllocations={income.incomeAllocations}
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
              render={({ field: { onChange, value } }) => {
                const b = DateBounds.transaction(value);
                return (
                  <DateInput
                    label="Date"
                    value={value}
                    onChange={onChange}
                    error={errors.date?.message}
                    disabled={loading}
                    minimumDate={b.minimumDate}
                    maximumDate={b.maximumDate}
                  />
                );
              }}
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
            onPrimary={handleSubmit(async (data) => {
              if (await save(data)) {
                setEditing(false);
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 2500);
              }
            })}
            primaryLoading={updating}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </>
      )}
    </FormStackScreen>
  );
}
