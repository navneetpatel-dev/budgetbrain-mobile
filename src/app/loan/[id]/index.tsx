import { useEffect, useRef, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  DetailSkeleton,
  EmptyState,
  FormStackScreen,
  FormSection,
  FormActions,
  DetailActions,
  DetailHero,
  DetailMetaList,
  ProgressBar,
  FormErrorBanner,
  FormSuccessBanner,
  useStackBack,
} from '@/shared/components/ui';
import { useLoanDetail, type LoanEditForm } from '@/features/loans/hooks/useLoanDetail';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { maxLen, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';

export default function LoanDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/loan' as Href);
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const openedInEdit = edit === '1' || edit === 'true';
  const { loan, isLoading, isError, refetch, isRefetching, loading, save, populateForm, confirmDelete, submitError } = useLoanDetail(id);
  const [editing, setEditing] = useState(openedInEdit);
  const [justSaved, setJustSaved] = useState(false);
  const editFromViewRef = useRef(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LoanEditForm>({
    defaultValues: { name: '', interestRate: '', emiAmount: '', notes: '' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [populateForm, reset]);

  const exitEdit = () => {
    if (editFromViewRef.current) {
      editFromViewRef.current = false;
      setEditing(false);
      return;
    }
    goBack();
  };

  const startEdit = () => {
    populateForm(reset);
    editFromViewRef.current = true;
    setEditing(true);
  };

  if (isLoading) {
    return (
      <FormStackScreen eyebrow="Loan" title="Loan" subtitle="Loading details" onBack={goBack}>
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !loan) {
    return (
      <FormStackScreen eyebrow="Loan" title="Loan" subtitle="Unavailable" onBack={goBack}>
        <EmptyState
          icon="wallet"
          title="Couldn't load loan"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const paidOff = Number(loan.principal) - Number(loan.remainingBalance);
  const pct = toSafePercent(paidOff, loan.principal);

  return (
    <FormStackScreen
      eyebrow={loan.type.replace(/_/g, ' ')}
      title={editing ? 'Edit Loan' : loan.name}
      subtitle={editing ? 'Update loan' : loan.closed ? 'Paid off' : `${pct}% paid off`}
      onBack={editing ? exitEdit : goBack}
      refreshControl={
        editing ? undefined : <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {justSaved ? <FormSuccessBanner message="Loan updated" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}

      {!editing ? (
        <>
          <DetailHero
            amount={formatCurrency(Number(loan.remainingBalance), loan.currency)}
            subtitle={`remaining of ${formatCurrency(Number(loan.principal), loan.currency)}`}
          />
          <View style={{ marginBottom: theme.spacing.lg }}>
            <ProgressBar progress={pct} color={loan.closed ? theme.colors.success : theme.colors.primary} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs }}>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary }}>
                {pct}% paid off
              </Text>
              {loan.closed ? (
                <Text style={{ ...theme.typography.caption, fontWeight: '600', color: theme.colors.success }}>Done</Text>
              ) : null}
            </View>
          </View>
          <DetailMetaList
            rows={[
              { label: 'Type', value: loan.type.replace(/_/g, ' ') },
              { label: 'Interest rate', value: loan.interestRate != null ? `${loan.interestRate}%` : '' },
              { label: 'Monthly EMI', value: loan.emiAmount != null ? formatCurrency(loan.emiAmount, loan.currency) : '' },
              { label: 'Started', value: loan.startDate },
              { label: 'Due day', value: loan.dueDayOfMonth ? String(loan.dueDayOfMonth) : '' },
              { label: 'Notes', value: loan.notes ?? '' },
            ]}
          />
          <DetailActions
            primaryTitle="Record payment"
            onPrimary={() => router.push(`/loan/${id}/pay`)}
            secondaryTitle="Edit"
            onSecondary={startEdit}
            onDestructive={confirmDelete}
            destructiveLoading={loading}
          />
        </>
      ) : (
        <>
          <FormSection title="Loan details">
            <Controller
              control={control}
              name="name"
              rules={textRules('entityName')}
              render={({ field: { onChange, value } }) => (
                <Input label="Loan name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="wallet" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="interestRate"
              render={({ field: { onChange, value } }) => (
                <Input label="Interest rate (%)" value={value} onChangeText={onChange} keyboardType="numeric" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="emiAmount"
              render={({ field: { onChange, value } }) => (
                <Input label="Monthly EMI" value={value} onChangeText={onChange} keyboardType="numeric" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="notes"
              rules={optionalTextRules('notes')}
              render={({ field: { onChange, value } }) => (
                <Input label="Notes" maxLength={maxLen('notes')} value={value} onChangeText={onChange} multiline disabled={loading} />
              )}
            />
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSubmit(async (data) => {
              if (await save(data)) {
                editFromViewRef.current = false;
                setEditing(false);
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 2500);
              }
            })}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={exitEdit}
          />
        </>
      )}
    </FormStackScreen>
  );
}
