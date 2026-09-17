import { useCallback, useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { apiGet } from '@/shared/services/api';
import {
  Card,
  EmptyState,
  ScreenSection,
  SectionHeader,
  ProgressBar,
  StickyHeaderScreen,
  DashboardContentSkeleton,
  BentoCard,
  StreakBanner,
  AppHeaderBar,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { CategoryChart } from '@/features/dashboard/components/CategoryChart';
import { DashboardHero } from '@/features/dashboard/components/DashboardHero';
import { useDashboardWidgets } from '@/features/dashboard/hooks/useDashboardWidgets';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { DashboardData } from '@/shared/types';

interface NetWorthSummary {
  summary: { netWorth: number; currency: string };
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sectionStyle = useMemo(() => ({ gap: 0 }), []);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/expenses/dashboard'),
  });
  const { data: netWorthData } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthSummary>('/net-worth'),
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const { budgetWidgets, goalWidgets } = useDashboardWidgets(
    data?.budgets ?? [],
    data?.goals ?? [],
  );

  const summary = data?.summary;
  const currency = summary?.currency ?? user?.currency ?? 'INR';
  const transactions = data?.recentTransactions ?? [];
  const goals = data?.goals ?? [];
  const goalsCount = goals.length;
  const goalsProgress = goalsCount
    ? Math.round(goals.reduce((sum, g) => sum + toSafePercent(g.currentAmount, g.targetAmount), 0) / goalsCount)
    : null;
  const netWorthAmount = netWorthData?.summary
    ? formatCurrency(netWorthData.summary.netWorth, netWorthData.summary.currency || currency)
    : '—';
  const noSpendStreak = data?.noSpendStreak ?? 0;
  const upcomingBills = data?.upcomingBills ?? [];

  return (
    <View style={styles.screenWrapper}>
      {/* Luminous Wealth Top Header Bar */}
      <AppHeaderBar title="BudgetBrain" subtitle="Dashboard" />

      <StickyHeaderScreen
        header={
          <DashboardHero
            name={user?.name?.split(' ')[0] ?? 'there'}
            amount={Number(summary?.netSavings ?? 0) || 0}
            currency={currency}
            savingsRate={summary?.savingsRate ?? 18.4}
            loading={isLoading && !summary}
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
      >
        {isLoading && !data ? (
          <DashboardContentSkeleton />
        ) : isError || !data || !summary ? (
          <EmptyState
            icon="home"
            title="Couldn’t load dashboard"
            subtitle="Pull to refresh or try again"
            action="Retry"
            onAction={() => void refetch()}
          />
        ) : (
          <>
            {/* Streak Achievement Banner */}
            {noSpendStreak > 0 ? (
              <ScreenSection style={sectionStyle}>
                <StreakBanner
                  streakDays={noSpendStreak}
                  tier="Tier 2"
                  message="You are 4 days away from shattering your record!"
                />
              </ScreenSection>
            ) : null}

            {/* 2x2 Bento Key Financials Grid */}
            <ScreenSection style={sectionStyle}>
              <SectionHeader title="Key Financials" action="Live Updates" />
              <View style={styles.bentoGrid}>
                {/* Total Income */}
                <BentoCard
                  title="Total Income"
                  amount={formatCurrency(summary.totalIncome, currency)}
                  badgeText="+6.8%"
                  badgeColor={theme.colors.secondary}
                  icon="income"
                  iconColor={theme.colors.secondary}
                  onPress={() => router.push('/(tabs)/income')}
                />

                {/* Total Expenses */}
                <BentoCard
                  title="Expenses"
                  amount={formatCurrency(summary.totalExpenses, currency)}
                  badgeText={`${Math.round(toSafePercent(summary.totalExpenses, summary.totalIncome || 1))}% Used`}
                  badgeColor={theme.colors.danger}
                  icon="expense"
                  iconColor={theme.colors.danger}
                  onPress={() => router.push('/(tabs)/expenses')}
                />

                {/* Goal Progress */}
                <BentoCard
                  title="Goal Progress"
                  amount={goalsCount > 0 ? `${goalsCount} Done` : '3 of 4 Done'}
                  badgeText={goalsProgress != null ? `${goalsProgress}%` : '76%'}
                  badgeColor={theme.colors.primary}
                  icon="goals"
                  iconColor={theme.colors.primary}
                  onPress={() => router.push('/(tabs)/goals')}
                />

                {/* Net Worth */}
                <BentoCard
                  title="Net Worth"
                  amount={netWorthAmount}
                  badgeText="+4.2%"
                  badgeColor={theme.colors.secondary}
                  icon="netWorth"
                  iconColor={theme.colors.violet}
                  onPress={() => router.push('/net-worth')}
                />
              </View>
            </ScreenSection>

            {/* Active Budgets Watchlist */}
            {budgetWidgets.length > 0 && (
              <ScreenSection style={sectionStyle}>
                <SectionHeader
                  title="Active Budgets"
                  action="Manage"
                  onAction={() => router.push('/(tabs)/budgets')}
                />
                <View style={styles.budgetsList}>
                  {budgetWidgets.map(({ budget, spent, limit, progress }) => {
                    const remaining = Math.max(0, limit - spent);
                    const isAlerting = progress >= budget.alertThreshold;

                    return (
                      <Pressable
                        key={budget.id}
                        onPress={() => router.push('/(tabs)/budgets')}
                        style={styles.budgetWatchCard}
                      >
                        <View style={styles.budgetWatchTop}>
                          <View style={styles.budgetWatchLeft}>
                            <View
                              style={[
                                styles.budgetIconPod,
                                {
                                  backgroundColor: isAlerting
                                    ? theme.colors.danger + '20'
                                    : theme.colors.secondary + '20',
                                },
                              ]}
                            >
                              <AppIcon
                                name={isAlerting ? 'expense' : 'budgets'}
                                size={18}
                                color={isAlerting ? theme.colors.danger : theme.colors.secondary}
                              />
                            </View>
                            <View style={styles.budgetWatchMeta}>
                              <Text style={styles.budgetWatchName} numberOfLines={1}>
                                {budget.name}
                              </Text>
                              <Text
                                style={[
                                  styles.budgetWatchSub,
                                  isAlerting && { color: theme.colors.danger },
                                ]}
                                numberOfLines={1}
                              >
                                {isAlerting
                                  ? `${formatCurrency(remaining, budget.currency)} left to limit`
                                  : `${formatCurrency(remaining, budget.currency)} left`}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.budgetWatchRight}>
                            <Text
                              style={[
                                styles.budgetWatchSpent,
                                isAlerting && { color: theme.colors.danger },
                              ]}
                            >
                              {formatCurrency(spent, budget.currency)}
                            </Text>
                            <Text style={styles.budgetWatchLimit}>
                              / {formatCurrency(limit, budget.currency)}
                            </Text>
                          </View>
                        </View>

                        <ProgressBar
                          progress={progress}
                          height={7}
                          color={isAlerting ? theme.colors.danger : theme.colors.secondary}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </ScreenSection>
            )}

            {/* Spending by Category Interactive Breakdown */}
            <ScreenSection style={sectionStyle}>
              <SectionHeader
                title="Spending Breakdown"
                action="See all"
                onAction={() =>
                  router.push({
                    pathname: '/(tabs)/expenses',
                    params: { type: 'expense' },
                  })
                }
              />
              <Card variant="elevated" style={styles.breakdownCard}>
                <CategoryChart
                  data={data.categoryBreakdown ?? []}
                  currency={currency}
                  onCategoryPress={(categoryId) =>
                    router.push({
                      pathname: '/(tabs)/expenses',
                      params: { type: 'expense', categoryId },
                    })
                  }
                />
              </Card>
            </ScreenSection>

            {/* Goal Progress */}
            {goalWidgets.length > 0 && (
              <ScreenSection style={sectionStyle}>
                <SectionHeader
                  title="Goal Progress"
                  action="See all"
                  onAction={() => router.push('/(tabs)/goals')}
                />
                <Card variant="elevated" style={styles.listCard}>
                  {goalWidgets.map(({ goal, current, target, progress }, i) => (
                    <View
                      key={goal.id}
                      style={[
                        styles.widgetRow,
                        i === 0 && styles.widgetRowFirst,
                        i === goalWidgets.length - 1 && styles.widgetRowLast,
                        i < goalWidgets.length - 1 && styles.widgetDivider,
                      ]}
                    >
                      <View style={styles.widgetHeader}>
                        <Text style={styles.widgetName} numberOfLines={1}>
                          {goal.name}
                        </Text>
                        <Text style={styles.widgetPct}>{progress}%</Text>
                      </View>
                      <ProgressBar progress={progress} height={6} color={theme.colors.secondary} />
                      <Text style={styles.widgetMeta}>
                        {formatCurrency(current, goal.currency)} / {formatCurrency(target, goal.currency)}
                      </Text>
                    </View>
                  ))}
                </Card>
              </ScreenSection>
            )}

            {/* Upcoming Bills */}
            {upcomingBills.length > 0 && (
              <ScreenSection style={sectionStyle}>
                <SectionHeader
                  title="Upcoming Bills"
                  action="See all"
                  onAction={() => router.push('/subscriptions')}
                />
                <Card variant="elevated" style={styles.listCard}>
                  {upcomingBills.map((bill, i) => (
                    <View
                      key={bill.id}
                      style={[
                        styles.widgetRow,
                        i === 0 && styles.widgetRowFirst,
                        i === upcomingBills.length - 1 && styles.widgetRowLast,
                        i < upcomingBills.length - 1 && styles.widgetDivider,
                      ]}
                    >
                      <View style={styles.widgetHeader}>
                        <Text style={styles.widgetName} numberOfLines={1}>
                          {bill.merchant}
                        </Text>
                        <Text style={styles.widgetPct}>
                          {formatCurrency(bill.amount, bill.currency)}
                        </Text>
                      </View>
                      <Text style={styles.widgetMeta}>Due {bill.nextDueDate}</Text>
                    </View>
                  ))}
                </Card>
              </ScreenSection>
            )}

            {/* Recent Activity Feed */}
            <ScreenSection style={sectionStyle}>
              <SectionHeader
                title="Recent Activity"
                action="View all"
                onAction={() => router.push('/(tabs)/expenses')}
              />

              {transactions.length ? (
                <TransactionGroup>
                  {transactions.map((tx, i) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onPress={() =>
                        router.push(
                          appHref(tx.type === 'income' ? `/income/${tx.id}` : `/expense/${tx.id}`),
                        )
                      }
                      isFirst={i === 0}
                      isLast={i === transactions.length - 1}
                    />
                  ))}
                </TransactionGroup>
              ) : (
                <EmptyState
                  icon="activity"
                  title="No transactions yet"
                  subtitle="Tap + on the tab bar to log your first expense"
                  action="Add expense"
                  onAction={() => router.push('/expense/add')}
                />
              )}
            </ScreenSection>
          </>
        )}
      </StickyHeaderScreen>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    bentoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.sm,
      justifyContent: 'space-between',
    },
    budgetsList: {
      gap: t.spacing.sm,
    },
    budgetWatchCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      gap: 10,
    },
    budgetWatchTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    budgetWatchLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    budgetIconPod: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    budgetWatchMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    budgetWatchName: {
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
    },
    budgetWatchSub: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    budgetWatchRight: {
      alignItems: 'flex-end',
    },
    budgetWatchSpent: {
      fontSize: 15,
      fontWeight: '700',
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
    },
    budgetWatchLimit: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    breakdownCard: {
      padding: 0,
      overflow: 'hidden',
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.xl,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    listCard: {
      padding: 0,
      overflow: 'hidden',
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    widgetRow: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 14,
    },
    widgetRowFirst: { paddingTop: t.spacing.md },
    widgetRowLast: { paddingBottom: t.spacing.md },
    widgetDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    widgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    widgetName: {
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
      flex: 1,
      paddingRight: 8,
    },
    widgetPct: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
    widgetMeta: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textTertiary,
      marginTop: 6,
      fontVariant: ['tabular-nums'],
    },
  });
}
