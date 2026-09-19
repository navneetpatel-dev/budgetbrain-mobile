import { useEffect, useRef, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';
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
  FormSuccessBanner,
  useStackBack,
} from '@/shared/components/ui';
import { useGoalDetail, type GoalForm } from '@/features/goals/hooks/useGoalDetail';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { amountRules, maxLen, optionalDateRules, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

export function GoalDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/(tabs)/goals' as Href);
  const { amountLabel } = useUserCurrency();
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const openedInEdit = edit === '1' || edit === 'true';
  const { goal, isLoading, isError, refetch, isRefetching, loading, save, populateForm, confirmDelete, submitError } = useGoalDetail(id);
  const [editing, setEditing] = useState(openedInEdit);
  const [justSaved, setJustSaved] = useState(false);
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

  // Server-computed — do not derive from currentAmount/targetAmount client-side (MOBILE doc §12).
  const pct = goal.progressPercentage;

  return (
    <FormStackScreen
      eyebrow={goal.type.replace(/_/g, ' ')}
      title={editing ? 'Edit Goal' : goal.name}
      subtitle={editing ? 'Update goal' : `${pct}% achieved`}
      onBack={editing ? exitEdit : goBack}
      refreshControl={
        editing ? undefined : <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {justSaved ? <FormSuccessBanner message="Goal updated" /> : null}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs }}>
              <Text style={{ ...theme.typography.caption, color: theme.colors.textTertiary }}>
                {pct}% achieved
              </Text>
              {pct >= 100 ? (
                <Text style={{ ...theme.typography.caption, fontWeight: '600', color: theme.colors.success }}>Done</Text>
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
          <View style={{ marginTop: theme.spacing.lg }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Contribution History
            </Text>
            {goal.contributions && goal.contributions.length > 0 ? (
              goal.contributions.map((c) => (
                <View
                  key={c.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: theme.colors.surfaceContainer,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSubtle,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontWeight: '500',
                        fontSize: 13,
                        color: theme.colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {c.note || 'Contribution'}
                    </Text>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 11,
                        color: theme.colors.textTertiary,
                        marginTop: 2,
                      }}
                    >
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: '700',
                      fontSize: 13,
                      color: theme.colors.success,
                    }}
                  >
                    +{formatCurrency(Number(c.amount), goal.currency)}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                }}
              >
                No contributions recorded yet.
              </Text>
            )}
          </View>
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
