import { useMemo } from 'react';
import { StyleSheet, Text, RefreshControl } from 'react-native';
import { Card, EmptyState, ListRowsSkeleton, StickyHeaderFlatScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useMarkNotificationRead } from '@/features/notifications/hooks/useMarkNotificationRead';

export default function NotificationsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMarkNotificationRead();

  const items = data ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <StickyHeaderFlatScreen
      inset="stack"
      header={
        <ProfileStackHeader
          screen="notifications"
          subtitle={isLoading ? 'Loading…' : unread > 0 ? `${unread} unread` : 'All caught up'}
        />
      }
      data={isLoading ? [] : items}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isFetchingNextPage ? <ListRowsSkeleton count={2} variant="notification" /> : null
      }
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={5} variant="notification" />
        ) : (
          <EmptyState title="No notifications" subtitle="You're all caught up" icon="bell" />
        )
      }
      renderItem={({ item }) => (
        <Card style={item.read ? styles.card : styles.unreadCard}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>{new Date(item.sentAt).toLocaleDateString()}</Text>
        </Card>
      )}
    />
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginBottom: 0 },
    unreadCard: { marginBottom: 0, borderLeftWidth: 3, borderLeftColor: t.colors.primary },
    title: { ...t.typography.bodyMedium, fontWeight: '700', color: t.colors.text },
    body: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginTop: 4 },
    date: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 8, fontSize: 11 },
  });
}
