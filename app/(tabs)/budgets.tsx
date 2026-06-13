import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/src/services/api';
import { Card, EmptyState } from '@/src/components/ui';
import { COLORS } from '@/src/constants/config';
import type { Budget } from '@/src/types';

export default function BudgetsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiGet<Budget[]>('/budgets'),
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
      ListEmptyComponent={<EmptyState title="No budgets yet" subtitle="Create a budget to track spending limits" />}
      renderItem={({ item }) => {
        const symbol = item.currency === 'INR' ? '₹' : item.currency;
        return (
          <Card style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetName}>{item.name}</Text>
              <Text style={styles.budgetType}>{item.type}</Text>
            </View>
            <Text style={styles.budgetAmount}>
              {symbol}{Number(item.amount).toLocaleString()}
            </Text>
            {item.category && (
              <Text style={styles.category}>{item.category.name}</Text>
            )}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
            <Text style={styles.alertText}>Alert at {item.alertThreshold}%</Text>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  budgetCard: { marginBottom: 12 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  budgetType: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' },
  budgetAmount: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  category: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  alertText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 6 },
});
