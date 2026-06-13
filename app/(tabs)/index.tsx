import { useMemo } from 'react';
import { StyleSheet, View, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { apiGet } from '@/src/services/api';
import {
  SummaryCard,
  Card,
  EmptyState,
  Screen,
  ScreenLoader,
  SectionHeader,
  ResponsiveGrid,
} from '@/src/components/ui';
import { TransactionItem, TransactionGroup } from '@/src/components/TransactionItem';
import { CategoryChart } from '@/src/components/CategoryChart';
import { DashboardHero } from '@/src/components/DashboardHero';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';
import { useAppSelector } from '@/src/store/hooks';
import type { DashboardData } from '@/src/types';

function formatCurrency(amount: number, currency: string) {
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { horizontalPadding } = useResponsive();
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/expenses/dashboard'),
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {},
        section: { marginBottom: theme.spacing.lg, paddingHorizontal: horizontalPadding },
        txList: { paddingHorizontal: horizontalPadding },
      }),
    [theme, horizontalPadding]
  );

  if (isLoading) return <ScreenLoader />;

  const summary = data?.summary;
  const currency = summary?.currency ?? user?.currency ?? 'INR';
  const transactions = data?.recentTransactions ?? [];

  return (
    <Screen
      padded={false}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      <DashboardHero
        name={user?.name?.split(' ')[0] ?? 'there'}
        netSavings={formatCurrency(summary?.netSavings ?? 0, currency)}
        currency={currency}
        savingsRate={summary?.savingsRate}
      />

      <View style={styles.section}>
        <ResponsiveGrid>
          <SummaryCard
            title="Income"
            amount={formatCurrency(summary?.totalIncome ?? 0, currency)}
            color={theme.colors.success}
            icon="income"
          />
          <SummaryCard
            title="Expenses"
            amount={formatCurrency(summary?.totalExpenses ?? 0, currency)}
            color={theme.colors.danger}
            icon="expense"
          />
          <SummaryCard
            title="Goals"
            amount="Track"
            subtitle="Savings targets"
            icon="goals"
            color={theme.colors.primary}
            onPress={() => router.push('/(tabs)/goals')}
          />
          <SummaryCard
            title="Net Worth"
            amount="Overview"
            subtitle="Assets & liabilities"
            icon="netWorth"
            color={theme.colors.primary}
            onPress={() => router.push('/(tabs)/net-worth')}
          />
        </ResponsiveGrid>
      </View>

      <View style={styles.section}>
        <Card variant="elevated">
          <SectionHeader title="Spending by Category" />
          <CategoryChart data={data?.categoryBreakdown ?? []} currency={currency} />
        </Card>
      </View>

      <View style={styles.txList}>
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
      </View>
    </Screen>
  );
}
