import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { TransactionItem } from '@/src/components/TransactionItem';
import { Card, EmptyState, ScreenLoader } from '@/src/components/ui';
import { Fab } from '@/src/components/Fab';
import { apiGet } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { IncomeSource, PaginatedTransactions } from '@/src/types';

export default function IncomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    return <ScreenLoader />;
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
            tintColor={theme.colors.primary}
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
      <Fab href="/income/add" />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    list: { padding: 16, paddingBottom: 80 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: t.colors.text, marginBottom: 8 },
    incomeTitle: { marginTop: 16, marginBottom: 8 },
    sourceCard: { marginBottom: 8 },
    sourceName: { fontSize: 15, fontWeight: '600', color: t.colors.text },
    sourceType: { fontSize: 12, color: t.colors.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    hint: { fontSize: 13, color: t.colors.textSecondary, marginBottom: 8 },
  });
}
