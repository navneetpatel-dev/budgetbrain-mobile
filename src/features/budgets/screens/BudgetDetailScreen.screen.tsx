import { useEffect, useRef, useState } from 'react';
import { RefreshControl, Text, View, Switch } from 'react-native';
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
import { useBudgetDetail, type BudgetForm } from '@/features/budgets/hooks/useBudgetDetail';
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget';
import { confirmDeleteBudget } from '@/features/budgets/services/confirmations';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { alertThresholdRules, amountRules, maxLen, textRules } from '@/shared/validation/fieldLimits';
import { showAlert } from '@/shared/utils/confirmations';

export function BudgetDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/(tabs)/budgets' as Href);
  const { amountLabel } = useUserCurrency();
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const openedInEdit = edit === '1' || edit === 'true';
  const { budget, isLoading, isError, refetch, isRefetching, loading, save, populateForm, submitError } = useBudgetDetail(id);
  const { deleteBudget } = useDeleteBudget();
  const [editing, setEditing] = useState(openedInEdit);
  const [deleting, setDeleting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  /** True only when Edit was tapped from the view screen (not list → ?edit=1). */
  const editFromViewRef = useRef(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BudgetForm>({
    defaultValues: { name: '', amount: '', alertThreshold: '80', rollover: false },
  });

  useEffect(() => {
    populateForm(reset);
  }, [budget, reset, populateForm]);

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
      <FormStackScreen eyebrow="Budget" title="Budget" subtitle="Loading details" onBack={goBack}>
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !budget) {
    return (
      <FormStackScreen eyebrow="Budget" title="Budget" subtitle="Unavailable" onBack={goBack}>
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
  const rolloverAmount = Number(budget.rolloverAmount ?? 0);
  const limit = Number(budget.effectiveAmount ?? budget.amount);
  // Server-computed (0-100, capped) — never derive from spent/limit client-side.
  const pct = budget.spentPercentage ?? 0;
  const alertAt = budget.alertThreshold ?? 80;
  const barColor = pct >= 100 ? theme.colors.danger : pct >= alertAt ? theme.colors.warning : theme.colors.success;

  return (
    <FormStackScreen
      eyebrow={`${budget.type.charAt(0).toUpperCase()}${budget.type.slice(1)} budget`}
      title={editing ? 'Edit Budget' : budget.name}
      subtitle={editing ? 'Update budget' : `${pct}% used`}
      onBack={editing ? exitEdit : goBack}
      refreshControl={
        editing ? undefined : <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {justSaved ? <FormSuccessBanner message="Budget updated" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}

      {!editing ? (
        <>
          <DetailHero
            amount={formatCurrency(spent, budget.currency)}
            subtitle={`of ${formatCurrency(limit, budget.currency)}`}
          />
          <View style={{ marginBottom: theme.spacing.lg }}>
            <ProgressBar progress={pct} color={barColor} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs }}>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary }}>
                {pct}% used
              </Text>
            </View>
          </View>
          <DetailMetaList
            rows={[
              { label: 'Period', value: `${budget.type.charAt(0).toUpperCase()}${budget.type.slice(1)}` },
              { label: 'Category', value: budget.category?.name ?? 'All spending' },
              { label: 'Alert', value: `${budget.alertThreshold}%` },
              { label: 'Started', value: budget.startDate },
              ...(budget.endDate ? [{ label: 'Ends', value: budget.endDate }] : []),
              ...(budget.rollover && rolloverAmount !== 0
                ? [{
                    label: 'Rollover',
                    value: `${rolloverAmount > 0 ? '+' : ''}${formatCurrency(rolloverAmount, budget.currency)} from last period`,
                  }]
                : []),
            ]}
          />
          <DetailActions
            primaryTitle="Edit"
            onPrimary={startEdit}
            onDestructive={() => {
              confirmDeleteBudget(budget.name, async () => {
                setDeleting(true);
                try {
                  await deleteBudget(budget.id);
                  goBack();
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
            {budget.type !== 'custom' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ ...theme.typography.bodySemibold, color: theme.colors.text }}>Roll over unused amount</Text>
                <Controller
                  control={control}
                  name="rollover"
                  render={({ field: { onChange, value } }) => (
                    <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.colors.primary }} disabled={loading} />
                  )}
                />
              </View>
            ) : null}
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            // eslint-disable-next-line react-hooks/refs -- the ref write below runs inside this submit callback (invoked on press via handleSubmit), never during render.
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
