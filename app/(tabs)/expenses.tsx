import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { apiGet } from '@/src/services/api';
import { TransactionItem, TransactionGroup } from '@/src/components/TransactionItem';
import { EmptyState, ScreenLoader } from '@/src/components/ui';
import { AppIcon } from '@/src/components/AppIcon';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';
import { useTabBarInset } from '@/src/hooks/useTabBarInset';
import type { Transaction } from '@/src/types';

export default function ExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { horizontalPadding, contentMaxWidth } = useResponsive();
  const tabBarInset = useTabBarInset();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', 'expense'],
    queryFn: () =>
      apiGet<{ transactions: Transaction[]; total: number }>('/expenses', { type: 'expense', limit: 50 }),
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
        },
        title: { ...theme.typography.display, fontSize: 28, color: theme.colors.text },
        subtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 4 },
        searchRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
        searchBtn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
        },
        searchText: { ...theme.typography.bodyMedium, color: theme.colors.textTertiary },
        incomeBtn: {
          width: 48,
          height: 48,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        list: {
          paddingHorizontal: horizontalPadding,
          paddingBottom: tabBarInset,
          maxWidth: contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
        },
      }),
    [theme, insets, horizontalPadding, contentMaxWidth]
  );

  if (isLoading) return <ScreenLoader />;

  const transactions = data?.transactions ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>
          {data?.total ?? transactions.length} transaction{(data?.total ?? 0) !== 1 ? 's' : ''}
        </Text>
        <View style={styles.searchRow}>
          <Pressable style={styles.searchBtn} onPress={() => router.push('/search')}>
            <AppIcon name="search" size={18} color={theme.colors.textTertiary} />
            <Text style={styles.searchText}>Search transactions</Text>
          </Pressable>
          <Pressable style={styles.incomeBtn} onPress={() => router.push('/income/add')}>
            <AppIcon name="income" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="activity"
            title="No expenses yet"
            subtitle="Your spending history will appear here"
            action="Add expense"
            onAction={() => router.push('/expense/add')}
          />
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: theme.spacing.sm }}>
            <TransactionItem
              transaction={item}
              onPress={() => router.push(appHref(`/expense/${item.id}`))}
              isFirst
              isLast
            />
          </View>
        )}
      />
    </View>
  );
}
