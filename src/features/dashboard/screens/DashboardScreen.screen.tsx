import { useMemo } from 'react';
import { View, RefreshControl, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
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
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem.component';
import { CategoryChart } from '@/features/dashboard/components/CategoryChart.component';
import { SpendingTrendChart } from '@/features/dashboard/components/SpendingTrendChart.component';
import { DashboardHero } from '@/features/dashboard/components/DashboardHero.component';
import { useDashboardScreen } from '@/features/dashboard/hooks/useDashboardScreen.hook';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { createStyles } from './DashboardScreen.styles';

export function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sectionStyle = useMemo(() => ({ gap: 0 }), []);
  const {
    user,
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    budgetWidgets,
    goalWidgets,
    summary,
    currency,
    transactions,
    goalsCount,
    goalsProgress,
    netWorthAmount,
    noSpendStreak,
    upcomingBills,
  } = useDashboardScreen();

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
            {budgetWidgets.length > 0 && (() => {
              const alertingCount = budgetWidgets.filter((w) => w.progress >= w.budget.alertThreshold).length;
              return (
              <ScreenSection style={sectionStyle}>
                <SectionHeader
                  title="Active Budgets"
                  badge={alertingCount > 0 ? `${alertingCount} Alerting` : undefined}
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
                          height={8}
                          gradientColors={
                            isAlerting
                              ? [theme.colors.warning, theme.colors.danger]
                              : [theme.colors.secondary, theme.colors.primary]
                          }
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </ScreenSection>
            );
            })()}

            {/* Spending Trends Chart */}
            {data.spendingTrends && (
              <ScreenSection style={sectionStyle}>
                <SpendingTrendChart trends={data.spendingTrends} currency={currency} />
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
