import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { apiGet } from '@/src/services/api';
import { TransactionItem } from '@/src/components/TransactionItem';
import { EmptyState } from '@/src/components/ui';
import { COLORS } from '@/src/constants/config';
import type { Transaction } from '@/src/types';
import { Text } from 'react-native';

export default function ExpensesScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', 'expense'],
    queryFn: () =>
      apiGet<{ transactions: Transaction[]; total: number }>('/expenses', { type: 'expense', limit: 50 }),
  });

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
        data={data?.transactions ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={<EmptyState title="No expenses yet" subtitle="Tap + to add your first expense" />}
      />
      <Link href="/expense/add" asChild>
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
  list: { padding: 16, paddingBottom: 80 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
