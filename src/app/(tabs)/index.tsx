import { useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { apiGet } from '@/shared/services/api';
import {
  SummaryCard,
  Card,
  EmptyState,
  ScreenSection,
  SectionHeader,
  SummaryMetricsGrid,
  ProgressBar,
  StickyHeaderScreen,
  DashboardContentSkeleton,
} from '@/shared/components/ui';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { CategoryChart } from '@/features/dashboard/components/CategoryChart';
import { DashboardHero } from '@/features/dashboard/components/DashboardHero';
import { useDashboardWidgets } from '@/features/dashboard/hooks/useDashboardWidgets';
import { useFloatingBlockGap } from '@/shared/hooks/useTabBarInset';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { formatCurrency } from '@/shared/utils/currency';
import type { DashboardData } from '@/shared/types';

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const blockGap = useFloatingBlockGap();
  const sectionStyle = useMemo(() => ({ gap: blockGap }), [blockGap]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/expenses/dashboard'),
  });

  const { budgetWidgets, goalWidgets } = useDashboardWidgets(
    data?.budgets ?? [],
    data?.goals ?? [],
  );

  const summary = data?.summary;
  const currency = summary?.currency ?? user?.currency ?? 'INR';
  const transactions = data?.recentTransactions ?? [];
  const goalsCount = data?.goals?.length ?? 0;

  return (
    <StickyHeaderScreen
      header={
        <DashboardHero
          name={user?.name?.split(' ')[0] ?? 'there'}
          netSavings={formatCurrency(summary?.netSavings ?? 0, currency)}
          currency={currency}
          savingsRate={summary?.savingsRate}
        />
      }
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {isLoading || !data || !summary ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <ScreenSection>
            <SummaryMetricsGrid>
              <SummaryCard
                title="Income"
                amount={formatCurrency(summary.totalIncome, currency)}
                subtitle="This month"
                color={theme.colors.success}
                icon="income"
                onPress={() => router.push('/(tabs)/income')}
              />
              <SummaryCard
                title="Expenses"
                amount={formatCurrency(summary.totalExpenses, currency)}
                subtitle="This month"
                color={theme.colors.danger}
                icon="expense"
                onPress={() => router.push('/(tabs)/expenses')}
              />
              <SummaryCard
                title="Goals"
                amount={goalsCount > 0 ? String(goalsCount) : 'Start'}
                subtitle={goalsCount > 0 ? `active goal${goalsCount !== 1 ? 's' : ''}` : 'Set a savings target'}
                icon="goals"
                color={theme.colors.primary}
                onPress={() => router.push('/(tabs)/goals')}
              />
              <SummaryCard
                title="Net Worth"
                amount="View"
                subtitle="Assets & liabilities"
                icon="netWorth"
                color={theme.colors.primary}
                onPress={() => router.push('/net-worth')}
              />
            </SummaryMetricsGrid>
          </ScreenSection>

          <ScreenSection>
            <Card variant="elevated">
              <SectionHeader title="Spending by Category" />
              <CategoryChart data={data.categoryBreakdown ?? []} currency={currency} />
            </Card>
          </ScreenSection>

          {budgetWidgets.length > 0 && (
            <ScreenSection style={sectionStyle}>
              <SectionHeader
                title="Budget Progress"
                action="See all"
                onAction={() => router.push('/(tabs)/budgets')}
              />
              <Card variant="elevated">
                {budgetWidgets.map(({ budget, spent, limit, progress }, i) => (
                  <View key={budget.id} style={[styles.widgetRow, i < budgetWidgets.length - 1 && styles.widgetDivider]}>
                    <View style={styles.widgetHeader}>
                      <Text style={styles.widgetName} numberOfLines={1}>{budget.name}</Text>
                      <Text style={styles.widgetPct}>{progress}%</Text>
                    </View>
                    <ProgressBar progress={progress} color={progress >= budget.alertThreshold ? theme.colors.warning : theme.colors.primary} />
                    <Text style={styles.widgetMeta}>
                      {formatCurrency(spent, budget.currency)} / {formatCurrency(limit, budget.currency)}
                    </Text>
                  </View>
                ))}
              </Card>
            </ScreenSection>
          )}

          {goalWidgets.length > 0 && (
            <ScreenSection style={sectionStyle}>
              <SectionHeader
                title="Goal Progress"
                action="See all"
                onAction={() => router.push('/(tabs)/goals')}
              />
              <Card variant="elevated">
                {goalWidgets.map(({ goal, current, target, progress }, i) => (
                  <View key={goal.id} style={[styles.widgetRow, i < goalWidgets.length - 1 && styles.widgetDivider]}>
                    <View style={styles.widgetHeader}>
                      <Text style={styles.widgetName} numberOfLines={1}>{goal.name}</Text>
                      <Text style={styles.widgetPct}>{progress}%</Text>
                    </View>
                    <ProgressBar progress={progress} color={theme.colors.success} />
                    <Text style={styles.widgetMeta}>
                      {formatCurrency(current, goal.currency)} / {formatCurrency(target, goal.currency)}
                    </Text>
                  </View>
                ))}
              </Card>
            </ScreenSection>
          )}

          <ScreenSection style={sectionStyle}>
            <SectionHeader
              title="Recent Activity"
              action="See all"
              onAction={() => router.push('/(tabs)/expenses')}
            />

            {transactions.length ? (
              <TransactionGroup>
                {transactions.map((tx, i) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onPress={() => router.push(appHref(`/expense/${tx.id}`))}
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
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    widgetRow: { paddingVertical: t.spacing.md },
    widgetDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    widgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    widgetName: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600', flex: 1, marginRight: 8 },
    widgetPct: { ...t.typography.caption, color: t.colors.textSecondary, fontWeight: '600' },
    widgetMeta: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 6 },
  });
}
