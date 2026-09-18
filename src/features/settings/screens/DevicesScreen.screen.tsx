import { useMemo } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { EmptyState, ListRowsSkeleton, StickyHeaderFlatScreen } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useDevices } from '@/features/settings/hooks/useDevices.hook';
import type { AccountDevice } from '@/features/settings/api/devices.api';
import { createStyles } from './DevicesScreen.styles';

function formatLastActive(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function DevicesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { devices, isLoading, isRefetching, refetch, confirmRevoke, revokingId } = useDevices();

  return (
    <View style={styles.root}>
      <StickyHeaderFlatScreen
        inset="stack"
        header={
          <ProfileStackHeader
            screen="devices"
            subtitle={isLoading ? 'Loading…' : `${devices.length} signed-in device${devices.length !== 1 ? 's' : ''}`}
          />
        }
        data={isLoading ? [] : devices}
        keyExtractor={(item: AccountDevice) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={3} variant="account" />
          ) : (
            <EmptyState icon="devices" title="No devices" subtitle="Devices with an active session will appear here." />
          )
        }
        renderItem={({ item }: { item: AccountDevice }) => (
          <View style={styles.item}>
            <View style={styles.itemIconWrap}>
              <AppIcon name="devices" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemName}>{item.deviceName ?? item.platform ?? 'Unknown device'}</Text>
              <Text style={styles.itemMeta}>Last active {formatLastActive(item.lastActiveAt)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sign out ${item.deviceName ?? 'device'}`}
              style={styles.revokeButton}
              disabled={revokingId === item.id}
              onPress={() => confirmRevoke(item)}
            >
              <Text style={styles.revokeLabel}>{revokingId === item.id ? 'Signing out…' : 'Sign out'}</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
