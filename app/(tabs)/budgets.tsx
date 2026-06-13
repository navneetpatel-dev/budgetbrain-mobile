import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Text, Alert, Pressable } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { apiGet, apiDelete } from '@/src/services/api';
import { Card, EmptyState } from '@/src/components/ui';
import { COLORS } from '@/src/constants/config';
import type { Budget, Transaction } from '@/src/types';

function getDateRange(budget: Budget): { startDate: string; endDate: string } {
  const now = new Date();
  if (budget.type === 'weekly') {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: budget.startDate ?? start.toISOString().split('T')[0],
    endDate: budget.endDate ?? end.toISOString().split('T')[0],
  };
}

function BudgetCard({ budget, expenses, onDelete }: { budget: Budget; expenses: Transaction[]; onDelete: () => void }) {
  const router = useRouter();
  const { startDate, endDate } = getDateRange(budget);
  const spent = useMemo(() => {
    return expenses
      .filter((e) => {
        const inRange = e.date >= startDate && e.date <= endDate;
        const matchesCategory = budget.type !== 'category' || e.categoryId === budget.categoryId;
        return inRange && matchesCategory;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses, budget, startDate, endDate]);

  const progress = Math.min(100, Math.round((spent / Number(budget.amount)) * 100));
  const symbol = budget.currency === 'INR' ? '₹' : budget.currency;
  const overBudget = spent > Number(budget.amount);

  const confirmDelete = () => {
    Alert.alert('Delete Budget', `Remove "${budget.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Card style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Text style={styles.budgetName}>{budget.name}</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push(appHref(`/budget/${budget.id}`))}>
            <Text style={styles.editBtn}>Edit</Text>
          </Pressable>
          <Pressable onPress={confirmDelete}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.budgetType}>{budget.type}</Text>
      <Text style={styles.budgetAmount}>
        {symbol}{spent.toLocaleString()} / {symbol}{Number(budget.amount).toLocaleString()}
      </Text>
      {budget.category && <Text style={styles.category}>{budget.category.name}</Text>}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: overBudget ? COLORS.danger : progress >= budget.alertThreshold ? COLORS.warning : COLORS.primary },
          ]}
        />
      </View>
      <Text style={styles.alertText}>{progress}% spent · Alert at {budget.alertThreshold}%</Text>
    </Card>
  );
}

export default function BudgetsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiGet<Budget[]>('/budgets'),
  });

  const { data: expenseData } = useQuery({
    queryKey: ['transactions', 'expense', 'budgets'],
    queryFn: () => apiGet<{ transactions: Transaction[] }>('/expenses', { type: 'expense', limit: 500 }),
  });

  const expenses = expenseData?.transactions ?? [];

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/budgets/${id}`);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch {
      Alert.alert('Error', 'Could not delete budget');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState title="No budgets yet" subtitle="Create a budget to track spending limits" />}
        renderItem={({ item }) => (
          <BudgetCard budget={item} expenses={expenses} onDelete={() => handleDelete(item.id)} />
        )}
      />
      <Link href={appHref('/budget/add')} asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80, gap: 12 },
  budgetCard: { marginBottom: 12 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  budgetName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  editBtn: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  deleteBtn: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  budgetType: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize', marginBottom: 8 },
  budgetAmount: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  category: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  alertText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 6 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
