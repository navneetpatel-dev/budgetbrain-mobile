import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
} from '@/shared/components/ui';
import { useBudgetDetail, type BudgetForm } from '@/features/budgets/hooks/useBudgetDetail';
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget';
import { confirmDeleteBudget } from '@/features/budgets/services/confirmations';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { alertThresholdRules, amountRules, maxLen, textRules } from '@/shared/validation/fieldLimits';
import { showAlert } from '@/shared/utils/confirmations';

export default function BudgetDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { budget, isLoading, isError, refetch, loading, save, populateForm, submitError } = useBudgetDetail(id);
  const { deleteBudget } = useDeleteBudget();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BudgetForm>({
    defaultValues: { name: '', amount: '', alertThreshold: '80' },
  });

  useEffect(() => {
    populateForm(reset);
  }, [budget, reset, populateForm]);

  if (isLoading) {
    return (
      <FormStackScreen eyebrow="Budget" title="Budget" subtitle="Loading details">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !budget) {
    return (
      <FormStackScreen eyebrow="Budget" title="Budget" subtitle="Unavailable">
        <EmptyState
          icon="budgets"
          title="Couldn’t load budget"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const spent = Number(budget.spent ?? 0);
  const limit = Number(budget.amount);
  const pct = toSafePercent(spent, limit);
  const alertAt = budget.alertThreshold ?? 80;
  const barColor = pct >= 100 ? theme.colors.danger : pct >= alertAt ? theme.colors.warning : theme.colors.success;

  return (
    <FormStackScreen
      eyebrow={`${budget.type} budget`}
      title={editing ? 'Edit Budget' : budget.name}
      subtitle={editing ? 'Update budget' : `${pct}% used`}
    >
      {submitError ? <FormErrorBanner message={submitError} /> : null}

      {!editing ? (
        <>
          <DetailHero
            amount={formatCurrency(spent, budget.currency)}
            subtitle={`of ${formatCurrency(limit, budget.currency)}`}
          />
          <View style={{ marginBottom: theme.spacing.lg }}>
            <ProgressBar progress={pct} color={barColor} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textTertiary }}>
                {pct}% used
              </Text>
            </View>
          </View>
          <DetailMetaList
            rows={[
              { label: 'Type', value: budget.type },
              { label: 'Alert', value: `${budget.alertThreshold}%` },
              { label: 'Started', value: budget.startDate },
              { label: 'Ends', value: budget.endDate ?? '' },
            ]}
          />
          <DetailActions
            primaryTitle="Edit"
            onPrimary={() => {
              populateForm(reset);
              setEditing(true);
            }}
            onDestructive={() => {
              confirmDeleteBudget(budget.name, async () => {
                setDeleting(true);
                try {
                  await deleteBudget(budget.id);
                  router.back();
                } catch {
                  showAlert('Error', 'Could not delete budget');
                } finally {
                  setDeleting(false);
                }
              });
            }}
            destructiveLoading={deleting}
          />
        </>
      ) : (
        <>
          <FormSection title="Budget details">
            <Controller
              control={control}
              name="name"
              rules={textRules('entityName')}
              render={({ field: { onChange, value } }) => (
                <Input label="Budget name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="amount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="alertThreshold"
              rules={alertThresholdRules()}
              render={({ field: { onChange, value } }) => (
                <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" disabled={loading} error={errors.alertThreshold?.message} />
              )}
            />
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSubmit(async (data) => {
              if (await save(data)) setEditing(false);
            })}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </>
      )}
    </FormStackScreen>
  );
}
