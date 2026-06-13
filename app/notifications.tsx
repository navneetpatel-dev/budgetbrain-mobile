import { StyleSheet, View, FlatList, Pressable, Text, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/src/services/api';
import { Card, EmptyState } from '@/src/components/ui';
import { COLORS } from '@/src/constants/config';
import type { NotificationItem } from '@/src/types';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<NotificationItem[]>('/notifications'),
  });

  const markRead = async (id: string) => {
    await apiPatch(`/notifications/${id}/read`);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onRefresh={refetch}
      refreshing={isRefetching}
      ListEmptyComponent={<EmptyState title="No notifications" subtitle="You're all caught up" />}
      renderItem={({ item }) => (
        <Pressable onPress={() => !item.read && markRead(item.id)}>
          <Card style={[styles.card, !item.read && styles.unread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.sentAt).toLocaleDateString()}</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { marginBottom: 10 },
  unread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  date: { fontSize: 11, color: COLORS.textSecondary, marginTop: 8 },
});
