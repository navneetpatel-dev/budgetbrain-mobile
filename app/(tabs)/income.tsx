import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/src/features/expenses/components/TransactionItem';
import { Card, EmptyState, ScreenSkeleton, ScreenContainer } from '@/src/shared/components/ui';
import { Fab } from '@/src/features/navigation/components/Fab';
import { apiGet } from '@/src/shared/services/api';
import { useTheme } from '@/src/shared/theme';
import { useTabBarInset } from '@/src/shared/hooks/useTabBarInset';
import type { IncomeSource, PaginatedTransactions } from '@/src/shared/types';

export default function IncomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['income'],
    queryFn: () => apiGet<PaginatedTransactions>('/income', { limit: 50 }),
  });

  const { data: sources, refetch: refetchSources } = useQuery({
    queryKey: ['income-sources'],
    queryFn: () => apiGet<IncomeSource[]>('/income/sources'),
  });

  const transactions = data?.transactions ?? [];

  if (isLoading) {
    return <ScreenSkeleton rows={4} />;
  }

  return (
    <ScreenContainer>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); refetchSources(); }}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
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
        renderItem={({ item, index }) => (
          <TransactionGroup>
            <TransactionItem
              transaction={item}
              onPress={() => router.push(appHref(`/income/${item.id}`))}
              showBadge
              isFirst
              isLast
            />
          </TransactionGroup>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState title="No income yet" subtitle="Tap + to add your first income entry" icon="income" />}
      />
      <Fab href="/income/add" aboveTabBar />
    </ScreenContainer>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    list: { paddingTop: t.spacing.lg },
    headerBlock: { marginBottom: t.spacing.sm },
    sectionTitle: { ...t.typography.title, fontSize: 18, color: t.colors.text, marginBottom: 8 },
    incomeTitle: { marginTop: 16, marginBottom: 8 },
    sourceCard: { marginBottom: 8 },
    sourceName: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    sourceType: { ...t.typography.caption, color: t.colors.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    hint: { ...t.typography.caption, color: t.colors.textSecondary, marginBottom: 8 },
    separator: { height: t.spacing.sm },
  });
}
