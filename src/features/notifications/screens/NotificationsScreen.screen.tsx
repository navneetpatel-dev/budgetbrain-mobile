import { useMemo, useState } from 'react';
import { Text, RefreshControl, View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { EmptyState, ListRowsSkeleton, AppHeaderBar, FilterChipsRail, type FilterChipItem } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useMarkNotificationRead } from '@/features/notifications/hooks/useMarkNotificationRead';
import { createStyles } from './NotificationsScreen.styles';

export function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
  const unreadCount = items.filter((n) => !n.read).length;

  const filterChips: FilterChipItem[] = [
    { id: 'all', label: `All (${items.length})` },
    { id: 'unread', label: `Unread (${unreadCount})` },
  ];

  const filteredItems = useMemo(() => {
    if (filter === 'unread') {
      return items.filter((n) => !n.read);
    }
    return items;
  }, [items, filter]);

  return (
    <View style={styles.root}>
      <AppHeaderBar
        title="Notifications"
        subtitle={isLoading ? 'Loading…' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
        onBack={() => router.back()}
      />

      <FlatList
        data={isLoading ? [] : filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <FilterChipsRail
              chips={filterChips}
              selectedId={filter}
              onSelect={(id) => setFilter(id as 'all' | 'unread')}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? <ListRowsSkeleton count={2} variant="notification" /> : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={5} variant="notification" />
          ) : (
            <EmptyState
              title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              subtitle="You're all caught up with alerts and system updates"
              icon="bell"
            />
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.unreadCard]}>
            <View style={styles.iconCol}>
              <View
                style={[
                  styles.iconPod,
                  {
                    backgroundColor: !item.read
                      ? theme.colors.primary + '1F'
                      : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  },
                ]}
              >
                <AppIcon
                  name={item.title?.toLowerCase().includes('budget') ? 'budgets' : 'bell'}
                  size={16}
                  color={!item.read ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.contentCol}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !item.read && styles.unreadTitle]} numberOfLines={1}>
                  {item.title}
                </Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>
                {new Date(item.sentAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

