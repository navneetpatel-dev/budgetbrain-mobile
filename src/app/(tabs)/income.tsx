import { useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  Card,
  EmptyState,
  ListSkeleton,
  ListRowsSkeleton,
  StickyHeaderFlatScreen,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { Fab } from '@/features/navigation/components/Fab';
import { useInfinitePaginatedList, usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import type { IncomeSource, Transaction } from '@/shared/types';

export default function IncomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const {
    items: transactions,
    total: transactionTotal,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePaginatedList<Transaction>({
    queryKey: ['income'],
    url: '/income',
    itemsKey: 'transactions',
    pageSize: 20,
  });

  const { data: sources, refetch: refetchSources } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources'],
    url: '/income/sources',
    itemsKey: 'sources',
  });

  if (isLoading) {
    return <ListSkeleton count={4} variant="transaction" />;
  }

  const sourceCount = sources?.length ?? 0;

  return (
    <View style={styles.root}>
      <StickyHeaderFlatScreen
        header={
          <ProfileStackHeader
            screen="income"
            subtitle={`${sourceCount} source${sourceCount !== 1 ? 's' : ''} · ${transactionTotal} entries`}
          />
        }
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); refetchSources(); }}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.sourcesBlock}>
            <Text style={styles.sectionLabel}>INCOME SOURCES</Text>
            {sources?.length ? (
              sources.map((src) => (
                <Card key={src.id} style={styles.sourceCard}>
                  <Text style={styles.sourceName}>{src.name}</Text>
                  <Text style={styles.sourceType}>{src.type.replace('_', ' ')}</Text>
                </Card>
              ))
            ) : (
              <Text style={styles.hint}>Add a source when recording your first income entry.</Text>
            )}
            <Text style={[styles.sectionLabel, styles.recentLabel]}>RECENT INCOME</Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? <ListRowsSkeleton count={2} variant="transaction" /> : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title="No income yet"
            subtitle="Tap + to add your first income entry"
            icon="income"
            action="Add income"
            onAction={() => router.push('/income/add')}
          />
        }
        renderItem={({ item }) => (
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
      />
      <Fab href="/income/add" aboveTabBar />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1 },
    sourcesBlock: { marginBottom: t.spacing.sm },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.9,
      color: t.colors.textTertiary,
      marginBottom: t.spacing.sm,
    },
    recentLabel: { marginTop: t.spacing.md },
    sourceCard: { marginBottom: t.spacing.sm },
    sourceName: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    sourceType: { ...t.typography.caption, color: t.colors.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    hint: { ...t.typography.caption, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
    separator: { height: t.spacing.sm },
  });
}
