import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Switch, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Card, Input } from '@/src/components/ui';
import { apiGet, apiDelete, apiPost, apiPatch, clearTokens, getRefreshToken } from '@/src/services/api';
import { logout, setUser } from '@/src/store/authSlice';
import { setBiometricEnabled } from '@/src/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { queryClient } from '@/src/services/queryClient';
import { COLORS, SUBSCRIPTION_PLANS, SUPPORTED_CURRENCIES } from '@/src/constants/config';
import { isBiometricAvailable, getBiometricType } from '@/src/services/biometrics';
import { useEffect } from 'react';
import { trackEvent } from '@/src/services/analytics';
import type { User } from '@/src/types';

interface ProfileForm {
  name: string;
  country: string;
  currency: string;
}

const NAV_LINKS = [
  { label: 'Support', href: '/support' },
  { label: 'Search Transactions', href: '/search' },
  { label: 'Categories', href: '/categories' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Investments', href: '/investments' },
  { label: 'Reports', href: '/reports' },
  { label: 'Family Groups', href: '/family' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Service', href: '/legal/terms' },
] as const;

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const biometricEnabled = useAppSelector((s) => s.settings.biometricEnabled);
  const offlineQueue = useAppSelector((s) => s.settings.offlineQueue);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' },
  });

  useEffect(() => {
    isBiometricAvailable().then(setBiometricSupported);
    getBiometricType().then(setBiometricType);
  }, []);

  useEffect(() => {
    reset({ name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' });
  }, [user, reset]);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () =>
      apiGet<{ role: string; plans: typeof SUBSCRIPTION_PLANS }>('/subscriptions/status'),
  });

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiPost('/auth/logout', { refreshToken });
      }
    } catch {
      // proceed with local logout even if server call fails
    }
    await clearTokens();
    dispatch(logout());
    queryClient.clear();
    trackEvent('user_logged_out');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await apiDelete('/users/me');
            await handleLogout();
          },
        },
      ]
    );
  };

  const saveProfile = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const updated = await apiPatch<User>('/users/me', data);
      if (updated) dispatch(setUser(updated));
      setEditingProfile(false);
    } catch {
      Alert.alert('Error', 'Could not update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert('Unavailable', `${biometricType} is not set up on this device.`);
        return;
      }
    }
    dispatch(setBiometricEnabled(value));
    trackEvent('biometric_toggled', { enabled: value });
  };

  const testPush = async () => {
    try {
      const result = await apiPost<{ sent: number }>('/notifications/test', {});
      Alert.alert('Push Test', result.sent > 0 ? 'Notification sent!' : 'No push token registered.');
    } catch {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const isPremium = ['premium', 'lifetime'].includes(user?.role ?? '');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <Text style={styles.name}>{user?.name ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role?.toUpperCase() ?? 'FREE'}</Text>
        </View>
        <View style={styles.spacer} />
        <Button title={editingProfile ? 'Cancel Edit' : 'Edit Profile'} onPress={() => setEditingProfile(!editingProfile)} variant="outline" />
      </Card>

      {editingProfile && (
        <Card style={styles.section}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input label="Name" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, value } }) => (
              <Input label="Country" value={value} onChangeText={onChange} />
            )}
          />
          <Text style={styles.fieldLabel}>Currency</Text>
          <View style={styles.currencyRow}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <Controller
                key={c}
                control={control}
                name="currency"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    onPress={() => onChange(c)}
                    style={[styles.currencyChip, value === c && styles.currencyChipActive]}
                  >
                    <Text style={[styles.currencyText, value === c && styles.currencyTextActive]}>{c}</Text>
                  </Pressable>
                )}
              />
            ))}
          </View>
          <Button title="Save Profile" onPress={handleSubmit(saveProfile)} loading={profileLoading} />
        </Card>
      )}

      {!isPremium && (
        <Card style={styles.planCard}>
          <Text style={styles.planTitle}>Upgrade to Premium</Text>
          <Text style={styles.planSubtitle}>Unlock AI insights, unlimited budgets, and more</Text>
          <Button title="View Plans" onPress={() => router.push('/subscription')} variant="outline" />
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        {NAV_LINKS.map((link) => (
          <Pressable key={link.href} onPress={() => router.push(appHref(link.href))} style={styles.navRow}>
            <Text style={styles.navLabel}>{link.label}</Text>
            <Text style={styles.navArrow}>›</Text>
          </Pressable>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>{biometricType} App Lock</Text>
            <Text style={styles.rowHint}>Require auth when reopening app</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometric}
            disabled={!biometricSupported}
            trackColor={{ true: COLORS.primary }}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Button title="Send Test Push" onPress={testPush} variant="outline" />
      </Card>

      {offlineQueue.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Sync</Text>
          <Text style={styles.rowHint}>{offlineQueue.length} item(s) pending sync</Text>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <InfoRow label="Currency" value={user?.currency ?? 'INR'} />
        <InfoRow label="Country" value={user?.country ?? '—'} />
        <InfoRow label="Plan" value={subscription?.role ?? user?.role ?? 'free'} />
      </Card>

      <Button title="Sign Out" onPress={handleLogout} variant="outline" />
      <View style={styles.spacer} />
      <Button title="Delete Account" onPress={handleDeleteAccount} variant="danger" />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  profileCard: { alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  badge: { marginTop: 12, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  planCard: { marginBottom: 16 },
  planTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  planSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginVertical: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  rowHint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 15, color: COLORS.text },
  infoValue: { fontSize: 15, color: COLORS.textSecondary },
  spacer: { height: 12 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navLabel: { fontSize: 15, color: COLORS.text },
  navArrow: { fontSize: 18, color: COLORS.textSecondary },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  currencyChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  currencyChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  currencyText: { fontSize: 13, color: COLORS.text },
  currencyTextActive: { color: '#fff', fontWeight: '600' },
});
