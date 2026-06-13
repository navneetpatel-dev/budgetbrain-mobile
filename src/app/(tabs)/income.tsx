import { useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  Card,
  EmptyState,
  ScreenSkeleton,
  StickyHeaderFlatScreen,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { Fab } from '@/features/navigation/components/Fab';
import { apiGet } from '@/shared/services/api';
import { useTheme } from '@/shared/theme';
import type { IncomeSource, PaginatedTransactions } from '@/shared/types';

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

  const transactions = data?.transactions ?? [];

  if (isLoading) {
    return <ScreenSkeleton rows={4} />;
  }

  const sourceCount = sources?.length ?? 0;

  return (
    <View style={styles.root}>
      <StickyHeaderFlatScreen
        header={
          <ProfileStackHeader
            screen="income"
            subtitle={`${sourceCount} source${sourceCount !== 1 ? 's' : ''} · ${transactions.length} entries`}
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
