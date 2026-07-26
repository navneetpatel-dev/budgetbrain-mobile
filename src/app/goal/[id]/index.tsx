import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
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
  ProgressBar,
  FormErrorBanner,
  useStackBack,
} from '@/shared/components/ui';
import { useGoalDetail, type GoalForm } from '@/features/goals/hooks/useGoalDetail';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { amountRules, maxLen, optionalDateRules, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

export default function GoalDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/(tabs)/goals' as Href);
  const { amountLabel } = useUserCurrency();
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const openedInEdit = edit === '1' || edit === 'true';
  const { goal, isLoading, isError, refetch, loading, save, populateForm, confirmDelete, submitError } = useGoalDetail(id);
  const [editing, setEditing] = useState(openedInEdit);
  /** True only when Edit was tapped from the view screen (not list → ?edit=1). */
  const editFromViewRef = useRef(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GoalForm>({
    defaultValues: { name: '', targetAmount: '', targetDate: '' },
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
      <FormStackScreen eyebrow="Goal" title="Goal" subtitle="Loading details" onBack={goBack}>
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !goal) {
    return (
      <FormStackScreen eyebrow="Goal" title="Goal" subtitle="Unavailable" onBack={goBack}>
        <EmptyState
          icon="goals"
          title="Couldn’t load goal"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const pct = toSafePercent(goal.currentAmount, goal.targetAmount);

  return (
    <FormStackScreen
      eyebrow={goal.type.replace(/_/g, ' ')}
      title={editing ? 'Edit Goal' : goal.name}
      subtitle={editing ? 'Update goal' : `${pct}% achieved`}
      onBack={editing ? exitEdit : goBack}
    >
      {submitError ? <FormErrorBanner message={submitError} /> : null}

      {!editing ? (
        <>
          <DetailHero
            amount={formatCurrency(Number(goal.currentAmount), goal.currency)}
            subtitle={`of ${formatCurrency(Number(goal.targetAmount), goal.currency)}`}
          />
          <View style={{ marginBottom: theme.spacing.lg }}>
            <ProgressBar
              progress={pct}
              color={pct >= 100 ? theme.colors.success : theme.colors.primary}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: theme.colors.textTertiary }}>
                {pct}% achieved
              </Text>
              {pct >= 100 ? (
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.success }}>Done</Text>
              ) : null}
            </View>
          </View>
          <DetailMetaList
            rows={[
              { label: 'Type', value: goal.type.replace(/_/g, ' ') },
              { label: 'Target', value: formatCurrency(Number(goal.targetAmount), goal.currency) },
              { label: 'Target date', value: goal.targetDate ?? '' },
            ]}
          />
          <DetailActions
            primaryTitle="Contribute"
            onPrimary={() => router.push(`/goal/${id}/contribute`)}
            secondaryTitle="Edit"
            onSecondary={startEdit}
            onDestructive={confirmDelete}
            destructiveLoading={loading}
          />
        </>
      ) : (
        <>
          <FormSection title="Goal details">
            <Controller
              control={control}
              name="name"
              rules={textRules('entityName')}
              render={({ field: { onChange, value } }) => (
                <Input label="Goal name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="goals" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="targetAmount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label={amountLabel('Target amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.targetAmount?.message} leftIcon="wallet" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="targetDate"
              rules={optionalDateRules()}
              render={({ field: { onChange, value } }) => {
                const b = DateBounds.goalTarget(value);
                return (
                  <DateInput
                    label="Target date"
                    value={value}
                    onChange={onChange}
                    error={errors.targetDate?.message}
                    disabled={loading}
                    minimumDate={b.minimumDate}
                    maximumDate={b.maximumDate}
                  />
                );
              }}
            />
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSubmit(async (data) => {
              if (await save(data)) {
                editFromViewRef.current = false;
                setEditing(false);
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
