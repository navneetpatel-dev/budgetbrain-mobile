import { useState } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/src/components/ui';
import { TransactionItem } from '@/src/components/TransactionItem';
import { apiGet } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';
import type { Transaction } from '@/src/types';

export default function SearchScreen() {
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
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  loader: { marginTop: 32 },
  hint: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 32, fontSize: 14 },
  list: { paddingTop: 8 },
});
