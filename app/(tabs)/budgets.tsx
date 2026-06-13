import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiGet } from '@/src/shared/services/api';
import { EmptyState, ScreenLoader, useScreenHeaderStyle, useScreenListStyle } from '@/src/shared/components/ui';
import { BudgetCard } from '@/src/features/budgets/components/BudgetCard';
import { useDeleteBudget } from '@/src/features/budgets/hooks/useDeleteBudget';
import { confirmDeleteBudget } from '@/src/features/budgets/services/confirmations';
import { AppIcon } from '@/src/features/navigation/components/AppIcon';
import { useTheme } from '@/src/shared/theme';
import { useTabBarInset } from '@/src/shared/hooks/useTabBarInset';
import type { Budget, Transaction } from '@/src/shared/types';

export default function BudgetsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabBarInset = useTabBarInset();
  const headerStyle = useScreenHeaderStyle(insets.top);
  const listStyle = useScreenListStyle(tabBarInset);
  const { deleteBudget } = useDeleteBudget();

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
        headerRow: {
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
      }),
    [theme],
  );

  if (isLoading) return <ScreenLoader />;

  return (
    <View style={styles.container}>
      <View style={headerStyle}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Budgets</Text>
            <Text style={styles.subtitle}>{data?.length ?? 0} active</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/budget/add')}
            accessibilityRole="button"
            accessibilityLabel="Create budget"
          >
            <AppIcon name="add" size={22} color={theme.colors.primary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={listStyle}
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
          <BudgetCard
            budget={item}
            expenses={expenseData?.transactions ?? []}
            onDelete={() =>
              confirmDeleteBudget(item.name, () =>
                deleteBudget(item.id).catch(() => Alert.alert('Error', 'Could not delete budget')),
              )
            }
          />
        )}
      />
    </View>
  );
}
