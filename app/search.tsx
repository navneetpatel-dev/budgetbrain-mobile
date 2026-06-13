import { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/shared/utils/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/src/shared/components/ui';
import { TransactionItem } from '@/src/features/expenses/components/TransactionItem';
import { apiGet } from '@/src/shared/services/api';
import { useTheme } from '@/src/shared/theme';
import type { Transaction } from '@/src/shared/types';

export default function SearchScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => apiGet<Transaction[]>('/expenses/search', { q: query }),
    enabled: query.length >= 2,
  });

  return (
    <View style={styles.container}>
      <Input
        label="Search transactions"
        value={query}
        onChangeText={setQuery}
        placeholder="Merchant, notes, category..."
        autoFocus
      />

      {isLoading || isFetching ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : query.length < 2 ? (
        <Text style={styles.hint}>Type at least 2 characters to search</Text>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.hint}>No results found</Text>}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => router.push(appHref(`/expense/${item.id}`))}
            />
          )}
        />
      )}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background, padding: 16 },
    loader: { marginTop: 32 },
    hint: { textAlign: 'center', color: t.colors.textSecondary, marginTop: 32, fontSize: 14 },
    list: { paddingTop: 8 },
  });
}
