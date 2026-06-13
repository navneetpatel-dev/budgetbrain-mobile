import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/src/services/api';
import { Card, EmptyState } from '@/src/components/ui';
import { COLORS } from '@/src/constants/config';
import type { Goal } from '@/src/types';

export default function GoalsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['goals'],
    queryFn: () => apiGet<Goal[]>('/goals'),
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
      ListEmptyComponent={<EmptyState title="No goals yet" subtitle="Set a financial goal to stay motivated" />}
      renderItem={({ item }) => {
        const progress = Math.min(
          100,
          Math.round((Number(item.currentAmount) / Number(item.targetAmount)) * 100)
        );
        const symbol = item.currency === 'INR' ? '₹' : item.currency;

        return (
          <Card style={styles.goalCard}>
            <Text style={styles.goalName}>{item.name}</Text>
            <Text style={styles.goalType}>{item.type.replace('_', ' ')}</Text>
            <View style={styles.amountRow}>
              <Text style={styles.current}>
                {symbol}{Number(item.currentAmount).toLocaleString()}
              </Text>
              <Text style={styles.target}>
                / {symbol}{Number(item.targetAmount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% complete</Text>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  goalCard: { marginBottom: 12 },
  goalName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  goalType: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize', marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  current: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  target: { fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 4 },
  progressText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },
});
