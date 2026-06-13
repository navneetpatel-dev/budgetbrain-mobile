import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/src/services/api';
import { Card, EmptyState, ScreenLoader } from '@/src/components/ui';
import { useTheme } from '@/src/theme';
import type { NotificationItem } from '@/src/types';

export default function NotificationsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    return <ScreenLoader />;
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
          <Card style={{ ...styles.card, ...(!item.read ? styles.unread : {}) }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.sentAt).toLocaleDateString()}</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    list: { padding: 16 },
    card: { marginBottom: 10 },
    unread: { borderLeftWidth: 3, borderLeftColor: t.colors.primary },
    title: { fontSize: 15, fontWeight: '700', color: t.colors.text },
    body: { fontSize: 14, color: t.colors.textSecondary, marginTop: 4 },
    date: { fontSize: 11, color: t.colors.textSecondary, marginTop: 8 },
  });
}
