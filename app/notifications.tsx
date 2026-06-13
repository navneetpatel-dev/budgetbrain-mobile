import { useMemo } from 'react';
import { StyleSheet, Text, FlatList, Pressable } from 'react-native';
import { Card, EmptyState, ScreenLoader, ScreenContainer } from '@/src/shared/components/ui';
import { useTheme } from '@/src/shared/theme';
import { useResponsive } from '@/src/shared/utils/responsive';
import { useMarkNotificationRead } from '@/src/features/notifications/hooks/useMarkNotificationRead';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { screenPaddingX, stackGap } = useResponsive();
  const styles = useMemo(() => createStyles(theme, screenPaddingX, stackGap), [theme, screenPaddingX, stackGap]);
  const { data, isLoading, refetch, isRefetching, markRead } = useMarkNotificationRead();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <ScreenContainer padded={false}>
      <FlatList
        style={styles.container}
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={<EmptyState title="No notifications" subtitle="You're all caught up" icon="bell" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => !item.read && markRead(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <Card style={{ ...styles.card, ...(!item.read ? styles.unread : {}) }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.date}>{new Date(item.sentAt).toLocaleDateString()}</Text>
            </Card>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, screenPaddingX: number, stackGap: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    list: { paddingHorizontal: screenPaddingX, paddingTop: stackGap, paddingBottom: stackGap, gap: stackGap },
    card: { marginBottom: 10 },
    unread: { borderLeftWidth: 3, borderLeftColor: t.colors.primary },
    title: { ...t.typography.bodyMedium, fontWeight: '700', color: t.colors.text },
    body: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginTop: 4 },
    date: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 8, fontSize: 11 },
  });
}
