import { useMemo, useState } from 'react';
import { RefreshControl, Text, View, Pressable } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import {
  Input,
  Card,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  DateInput,
  StackScrollScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
  FormSuccessBanner,
  EmptyState,
  ListRowsSkeleton,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useRecurringSeries, monthlyEquivalent } from '@/features/recurring/hooks/useRecurringSeries';
import { useCreateRecurringSeries, type RecurringSeriesForm } from '@/features/recurring/hooks/useCreateRecurringSeries';
import { useRecurringSeriesActions } from '@/features/recurring/hooks/useRecurringSeriesActions';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { amountRules, dateRules, maxLen, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';
import { createStyles } from './SubscriptionsScreen.styles';

const CADENCES = ['weekly', 'monthly', 'yearly'] as const;

export function SubscriptionsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { amountLabel } = useUserCurrency();
  const [showAdd, setShowAdd] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { data: series, isLoading, isRefetching, refetch } = useRecurringSeries();
  const { data: categories } = useCategoryOptions();
  const { create, loading: creating, submitError } = useCreateRecurringSeries();
  const { dismiss, remove, pendingId } = useRecurringSeriesActions();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<RecurringSeriesForm>({
    defaultValues: { merchant: '', categoryId: '', amount: '', cadence: 'monthly', nextDueDate: toIsoDate(new Date()) },
  });
  const cadence = watch('cadence');

  const active = (series ?? []).filter((s) => s.active);
  const totalMonthly = active.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  const currency = active[0]?.currency ?? 'INR';

  const onSubmit = async (data: RecurringSeriesForm) => {
    if (await create(data)) {
      reset({ merchant: '', categoryId: '', amount: '', cadence: 'monthly', nextDueDate: toIsoDate(new Date()) });
      setShowAdd(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  };

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="subscriptions"
          subtitle={
            isLoading
              ? 'Loading…'
              : `${active.length} active · ${formatCurrency(totalMonthly, currency)}/mo`
          }
        />
      }
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      {justSaved ? <FormSuccessBanner message="Subscription added" /> : null}
      {isLoading ? <ListRowsSkeleton count={3} variant="transaction" /> : null}

      {!isLoading && active.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No subscriptions yet"
          subtitle="Recurring expenses you log get detected automatically, or add one manually below"
        />
      ) : null}

      {!isLoading && active.length > 0 ? (
        <FormSection title="Active" subtitle={`${active.length} recurring bill${active.length !== 1 ? 's' : ''}`}>
          {active.map((s) => (
            <Card key={s.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.merchant}>{s.merchant}</Text>
                  <Text style={styles.meta}>
                    {formatCurrency(s.amount, s.currency)} · {s.cadence} · next {s.nextDueDate}
                    {s.source === 'detected' ? ' · detected' : ''}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Pressable onPress={() => dismiss(s.id)} disabled={pendingId === s.id} hitSlop={8}>
                    <Text style={styles.actionText}>Dismiss</Text>
                  </Pressable>
                  <Pressable onPress={() => remove(s.id)} disabled={pendingId === s.id} hitSlop={8}>
                    <Text style={[styles.actionText, { color: theme.colors.danger }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </FormSection>
      ) : null}

      <FormSection
        title="Add a subscription"
        subtitle="Track a bill or subscription manually"
      >
        {!showAdd ? (
          <Pressable onPress={() => setShowAdd(true)} style={styles.addRow}>
            <Text style={styles.addRowText}>+ Add subscription</Text>
          </Pressable>
        ) : (
          <>
            {submitError ? <FormErrorBanner message={submitError} /> : null}
            <Controller
              control={control}
              name="merchant"
              rules={textRules('merchant')}
              render={({ field: { onChange, value } }) => (
                <Input label="Merchant" value={value} onChangeText={onChange} maxLength={maxLen('merchant')} placeholder="e.g. Netflix" error={errors.merchant?.message} leftIcon="activity" disabled={creating} />
              )}
            />
            <Controller
              control={control}
              name="amount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" disabled={creating} />
              )}
            />
            <FormFieldLabel>Cadence</FormFieldLabel>
            <OptionChips
              options={[...CADENCES]}
              value={cadence}
              onChange={(v) => setValue('cadence', v)}
              getLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              disabled={creating}
            />
            <View style={{ marginTop: theme.spacing.lg }}>
              <Controller
                control={control}
                name="nextDueDate"
                rules={dateRules('budgetStart')}
                render={({ field: { onChange, value } }) => {
                  const b = DateBounds.budgetStart(value);
                  return (
                    <DateInput
                      label="Next due date"
                      value={value}
                      onChange={onChange}
                      error={errors.nextDueDate?.message}
                      disabled={creating}
                      minimumDate={b.minimumDate}
                      maximumDate={b.maximumDate}
                    />
                  );
                }}
              />
            </View>
            <View style={{ marginTop: theme.spacing.lg }}>
              <FormFieldLabel>Category (optional)</FormFieldLabel>
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { onChange, value } }) => (
                  <OptionChipList
                    items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
                    selectedId={value}
                    onSelect={onChange}
                    disabled={creating}
                  />
                )}
              />
            </View>
            <FormActions
              primaryTitle="Add Subscription"
              onPrimary={handleSubmit(onSubmit)}
              primaryLoading={creating}
              secondaryTitle="Cancel"
              onSecondary={() => setShowAdd(false)}
            />
          </>
        )}
      </FormSection>
    </StackScrollScreen>
  );
}

