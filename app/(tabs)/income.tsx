import { StyleSheet, View, FlatList, RefreshControl, ActivityIndicator, Pressable, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { TransactionItem } from '@/src/components/TransactionItem';
import { Card, EmptyState } from '@/src/components/ui';
import { apiGet } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';
import type { IncomeSource, PaginatedTransactions } from '@/src/types';

export default function IncomeScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['income'],
    queryFn: () => apiGet<PaginatedTransactions>('/income', { limit: 50 }),
  });

  const { data: sources, refetch: refetchSources } = useQuery({
    queryKey: ['income-sources'],
    queryFn: () => apiGet<IncomeSource[]>('/income/sources'),
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
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); refetchSources(); }}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Income Sources</Text>
            {sources?.length ? (
              sources.map((src) => (
                <Card key={src.id} style={styles.sourceCard}>
                  <Text style={styles.sourceName}>{src.name}</Text>
                  <Text style={styles.sourceType}>{src.type.replace('_', ' ')}</Text>
                </Card>
              ))
            ) : (
              <Text style={styles.hint}>No income sources yet. Add one when recording income.</Text>
            )}
            <Text style={[styles.sectionTitle, styles.incomeTitle]}>Recent Income</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(appHref(`/income/${item.id}`))}
          />
        )}
        ListEmptyComponent={<EmptyState title="No income yet" subtitle="Tap + to add your first income entry" />}
      />
      <Link href={appHref('/income/add')} asChild>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  incomeTitle: { marginTop: 16, marginBottom: 8 },
  sourceCard: { marginBottom: 8 },
  sourceName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  sourceType: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize', marginTop: 2 },
  hint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.success,
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
