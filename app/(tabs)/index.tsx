import { StyleSheet, View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { apiGet } from '@/src/services/api';
import { SummaryCard, Card, EmptyState } from '@/src/components/ui';
import { TransactionItem } from '@/src/components/TransactionItem';
import { CategoryChart } from '@/src/components/CategoryChart';
import { COLORS } from '@/src/constants/config';
import { useAppSelector } from '@/src/store/hooks';
import type { DashboardData } from '@/src/types';

function formatCurrency(amount: number, currency: string) {
  const symbol = currency === 'INR' ? '₹' : currency + ' ';
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function DashboardScreen() {
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/expenses/dashboard'),
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const summary = data?.summary;
  const currency = summary?.currency ?? user?.currency ?? 'INR';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>

      <View style={styles.summaryGrid}>
        <SummaryCard title="Income" amount={formatCurrency(summary?.totalIncome ?? 0, currency)} color={COLORS.success} />
        <SummaryCard title="Expenses" amount={formatCurrency(summary?.totalExpenses ?? 0, currency)} color={COLORS.danger} />
        <SummaryCard title="Net Savings" amount={formatCurrency(summary?.netSavings ?? 0, currency)} color={COLORS.primary} />
        <SummaryCard title="Savings Rate" amount={`${summary?.savingsRate ?? 0}%`} subtitle="This period" />
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <CategoryChart data={data?.categoryBreakdown ?? []} currency={currency} />
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Link href="/(tabs)/expenses" style={styles.seeAll}>See all</Link>
      </View>

      {data?.recentTransactions?.length ? (
        data.recentTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
      ) : (
        <EmptyState title="No transactions yet" subtitle="Add your first expense to get started" />
      )}

      <Link href="/expense/add" style={styles.fab}>
        <Text style={styles.fabText}>+ Add Expense</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  fab: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
