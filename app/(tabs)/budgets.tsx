import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { apiGet, apiDelete } from '@/src/services/api';
import { Card, EmptyState, ScreenLoader, ProgressBar } from '@/src/components/ui';
import { AppIcon } from '@/src/components/AppIcon';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';
import { useTabBarInset } from '@/src/hooks/useTabBarInset';
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
  const theme = useTheme();
  const styles = useMemo(() => createBudgetCardStyles(theme), [theme]);
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
  const fillColor = overBudget
    ? theme.colors.danger
    : progress >= budget.alertThreshold
      ? theme.colors.warning
      : theme.colors.primary;

  const confirmDelete = () => {
    Alert.alert('Delete Budget', `Remove "${budget.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Card variant="elevated" style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <View style={styles.titleCol}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Text style={styles.budgetType}>{budget.type}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push(appHref(`/budget/${budget.id}`))} hitSlop={8}>
            <AppIcon name="settings" size={18} color={theme.colors.textTertiary} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={8}>
            <AppIcon name="expense" size={18} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.budgetAmount}>
        {symbol}{spent.toLocaleString()} <Text style={styles.budgetLimit}>/ {symbol}{Number(budget.amount).toLocaleString()}</Text>
      </Text>
      {budget.category && <Text style={styles.category}>{budget.category.name}</Text>}
      <ProgressBar progress={progress} color={fillColor} style={{ marginTop: 12 }} />
      <Text style={styles.alertText}>{progress}% used · alerts at {budget.alertThreshold}%</Text>
    </Card>
  );
}

export default function BudgetsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { horizontalPadding, contentMaxWidth } = useResponsive();
  const tabBarInset = useTabBarInset();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiGet<Budget[]>('/budgets'),
  });

  const { data: expenseData } = useQuery({
    queryKey: ['transactions', 'expense', 'budgets'],
    queryFn: () => apiGet<{ transactions: Transaction[] }>('/expenses', { type: 'expense', limit: 500 }),
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        header: {
          paddingTop: insets.top + 12,
          paddingHorizontal: horizontalPadding,
          paddingBottom: theme.spacing.lg,
          maxWidth: contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        },
        title: { ...theme.typography.display, fontSize: 28, color: theme.colors.text },
        subtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
        addBtn: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        list: {
          paddingHorizontal: horizontalPadding,
          paddingBottom: tabBarInset,
          gap: 12,
          maxWidth: contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
        },
      }),
    [theme, insets, horizontalPadding, contentMaxWidth]
  );

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/budgets/${id}`);
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch {
      Alert.alert('Error', 'Could not delete budget');
    }
  };

  if (isLoading) return <ScreenLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budgets</Text>
          <Text style={styles.subtitle}>{data?.length ?? 0} active</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/budget/add')}>
          <AppIcon name="add" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="budgets"
            title="No budgets yet"
            subtitle="Set spending limits to stay on track"
            action="Create budget"
            onAction={() => router.push('/budget/add')}
          />
        }
        renderItem={({ item }) => (
          <BudgetCard budget={item} expenses={expenseData?.transactions ?? []} onDelete={() => handleDelete(item.id)} />
        )}
      />
    </View>
  );
}

function createBudgetCardStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    budgetCard: { marginBottom: 0 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleCol: { flex: 1 },
    budgetName: { ...t.typography.titleSm, color: t.colors.text },
    budgetType: { ...t.typography.caption, color: t.colors.textTertiary, textTransform: 'capitalize', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 12 },
    budgetAmount: { ...t.typography.amount, color: t.colors.text },
    budgetLimit: { ...t.typography.bodyMedium, color: t.colors.textSecondary, fontWeight: '500' },
    category: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
    alertText: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 8 },
  });
}
