import { useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  Card,
  EmptyState,
  ListRowsSkeleton,
  FeatureHeader,
  StickyHeaderFlatScreen,
  useStackBack,
} from '@/shared/components/ui';
import { useInfinitePaginatedList, usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import type { IncomeSource, Transaction } from '@/shared/types';

export default function IncomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const goBack = useStackBack('/(tabs)' as Href);

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

  const sourceCount = sources?.length ?? 0;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="EARN"
          title="Income"
          subtitle={
            isLoading
              ? 'Loading…'
              : `${sourceCount} source${sourceCount !== 1 ? 's' : ''} · ${transactionTotal} entries`
          }
          actionIcon="add"
          actionLabel="Add income"
          onAction={() => router.push('/income/add')}
        />
      }
      data={isLoading ? [] : transactions}
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
        isLoading ? null : (
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
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? <ListRowsSkeleton count={2} variant="transaction" /> : null
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="transaction" />
        ) : (
          <EmptyState
            title="No income yet"
            subtitle="Record your first income entry"
            icon="income"
            action="Add income"
            onAction={() => router.push('/income/add')}
          />
        )
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
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
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
