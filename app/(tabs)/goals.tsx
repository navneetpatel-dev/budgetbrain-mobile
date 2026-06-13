import { useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { apiGet } from '@/src/services/api';
import { Card, EmptyState, ScreenLoader } from '@/src/components/ui';
import { Fab } from '@/src/components/Fab';
import { useTheme } from '@/src/theme';
import type { Goal } from '@/src/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['goals'],
    queryFn: () => apiGet<Goal[]>('/goals'),
  });

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={<EmptyState title="No goals yet" subtitle="Set a financial goal to stay motivated" />}
        renderItem={({ item }) => {
          const progress = Math.min(100, Math.round((Number(item.currentAmount) / Number(item.targetAmount)) * 100));
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
              <View style={styles.goalActions}>
                <Pressable onPress={() => router.push(appHref(`/goal/${item.id}`))}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => router.push(appHref(`/goal/${item.id}/contribute`))}>
                  <Text style={styles.contributeText}>+ Contribute</Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
      <Fab href="/goal/add" />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    list: { padding: 16, paddingBottom: 80 },
    goalCard: { marginBottom: 12 },
    goalName: { fontSize: 16, fontWeight: '700', color: t.colors.text },
    goalType: { fontSize: 12, color: t.colors.textSecondary, textTransform: 'capitalize', marginBottom: 8 },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    current: { fontSize: 22, fontWeight: '800', color: t.colors.primary },
    target: { fontSize: 14, color: t.colors.textSecondary, marginLeft: 4 },
    progressBar: { height: 8, backgroundColor: t.colors.border, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: t.colors.success, borderRadius: 4 },
    progressText: { fontSize: 12, color: t.colors.textSecondary, marginTop: 6 },
    goalActions: { flexDirection: 'row', gap: 16, marginTop: 12 },
    editText: { color: t.colors.textSecondary, fontWeight: '600', fontSize: 14 },
    contributeText: { color: t.colors.primary, fontWeight: '600', fontSize: 14 },
  });
}
