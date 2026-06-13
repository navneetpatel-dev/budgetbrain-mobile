import { useState, useMemo } from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input, FeatureHeader, StickyHeaderFlatScreen, EmptyState } from '@/shared/components/ui';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { apiGet } from '@/shared/services/api';
import { useTheme } from '@/shared/theme';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import type { Transaction } from '@/shared/types';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => apiGet<Transaction[]>('/expenses/search', { q: query }),
    enabled: query.length >= 2,
  });

  const results = data ?? [];
  const searching = isLoading || isFetching;

  return (
    <StickyHeaderFlatScreen
      inset="stack"
      header={
        <FeatureHeader
          eyebrow="FIND"
          title="Search"
          subtitle="Merchant, notes, or category"
          footer={
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Type to search..."
              autoFocus
              leftIcon="search"
            />
          }
        />
      }
      data={query.length >= 2 && !searching ? results : []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: fabBottom }}
      ListHeaderComponent={
        searching ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : query.length < 2 ? (
          <Text style={styles.hint}>Type at least 2 characters to search</Text>
        ) : null
      }
      ListEmptyComponent={
        query.length >= 2 && !searching ? (
          <EmptyState icon="search" title="No results" subtitle="Try a different search term" />
        ) : null
      }
      renderItem={({ item }) => (
        <TransactionGroup>
          <TransactionItem
            transaction={item}
            onPress={() => router.push(appHref(`/expense/${item.id}`))}
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
    loader: { marginTop: 32 },
    hint: { textAlign: 'center', color: t.colors.textSecondary, marginTop: 32, fontSize: 14 },
  });
}
