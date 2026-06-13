import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Alert, Switch, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Screen,
  GroupedCard,
  ListRow,
} from '@/src/components/ui';
import { ThemePicker } from '@/src/components/ThemePicker';
import { apiGet, apiDelete, apiPost, apiPatch, clearTokens, getRefreshToken } from '@/src/services/api';
import { logout, setUser } from '@/src/store/authSlice';
import { setBiometricEnabled, setTheme, setAccent } from '@/src/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { queryClient } from '@/src/services/queryClient';
import { SUBSCRIPTION_PLANS, SUPPORTED_CURRENCIES } from '@/src/constants/config';
import { isBiometricAvailable, getBiometricType } from '@/src/services/biometrics';
import { trackEvent } from '@/src/services/analytics';
import { useTheme } from '@/src/theme';
import { useResponsive } from '@/src/utils/responsive';
import type { User } from '@/src/types';
import type { AppIconName } from '@/src/components/AppIcon';

interface ProfileForm {
  name: string;
  country: string;
  currency: string;
}

const FEATURE_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Goals', href: '/(tabs)/goals', icon: 'goals' },
  { label: 'Income', href: '/(tabs)/income', icon: 'income' },
  { label: 'AI Insights', href: '/(tabs)/ai', icon: 'ai' },
  { label: 'Net Worth', href: '/(tabs)/net-worth', icon: 'netWorth' },
  { label: 'Reports', href: '/reports', icon: 'chart' },
  { label: 'Categories', href: '/categories', icon: 'category' },
];

const ACCOUNT_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Accounts', href: '/accounts', icon: 'wallet' },
  { label: 'Investments', href: '/investments', icon: 'chart' },
  { label: 'Family Groups', href: '/family', icon: 'family' },
  { label: 'Integrations', href: '/integrations', icon: 'link' },
  { label: 'Notifications', href: '/notifications', icon: 'bell' },
  { label: 'Support', href: '/support', icon: 'support' },
  { label: 'Privacy Policy', href: '/legal/privacy', icon: 'document' },
  { label: 'Terms of Service', href: '/legal/terms', icon: 'document' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const settings = useAppSelector((s) => s.settings);
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hero: {
          paddingTop: insets.top + 16,
          paddingHorizontal: horizontalPadding,
          paddingBottom: 28,
          marginBottom: theme.spacing.lg,
          borderBottomLeftRadius: theme.radii.xl,
          borderBottomRightRadius: theme.radii.xl,
        },
        avatar: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        },
        avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
        name: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
        email: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
        badge: {
          alignSelf: 'flex-start',
          marginTop: theme.spacing.md,
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: theme.radii.full,
        },
        badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
        body: { paddingHorizontal: horizontalPadding },
        premium: {
          marginBottom: theme.spacing.lg,
          padding: theme.spacing.lg,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.primarySoft,
          borderWidth: 1,
          borderColor: theme.colors.primary + '33',
        },
        premiumTitle: { ...theme.typography.titleSm, color: theme.colors.text },
        premiumSub: { ...theme.typography.caption, color: theme.colors.textSecondary, marginVertical: 8 },
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: theme.spacing.lg,
        },
        switchLabel: { ...theme.typography.bodyMedium, color: theme.colors.text, fontWeight: '600' },
        switchHint: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
        currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.lg },
        currencyChip: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: theme.radii.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        currencyChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
        currencyText: { fontSize: 13, color: theme.colors.text },
        currencyTextActive: { color: theme.colors.onPrimary, fontWeight: '600' },
        actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg, marginBottom: theme.spacing.xxl },
      }),
    [theme, insets, horizontalPadding]
  );

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await apiPost('/auth/logout', { refreshToken });
    } catch { /* proceed */ }
    await clearTokens();
    dispatch(logout());
    queryClient.clear();
    trackEvent('user_logged_out');
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is permanent and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await apiDelete('/users/me'); await handleLogout(); } },
    ]);
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

  const isPremium = ['premium', 'lifetime'].includes(user?.role ?? '');

  return (
    <Screen padded={false}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{(user?.role ?? 'free').toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {!isPremium && (
          <View style={styles.premium}>
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumSub}>AI insights, unlimited budgets, and advanced reports</Text>
            <Button title="View plans" onPress={() => router.push('/subscription')} variant="primary" size="md" />
          </View>
        )}

        <GroupedCard title="Features">
          {FEATURE_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => router.push(appHref(link.href))}
              isLast={i === FEATURE_LINKS.length - 1}
            />
          ))}
        </GroupedCard>

        <GroupedCard title="Account">
          {ACCOUNT_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => router.push(appHref(link.href))}
              isLast={i === ACCOUNT_LINKS.length - 1}
            />
          ))}
        </GroupedCard>

        <GroupedCard title="Appearance">
          <View style={{ padding: theme.spacing.lg }}>
            <ThemePicker
              mode={settings.theme}
              accent={settings.accent}
              onModeChange={(m) => dispatch(setTheme(m))}
              onAccentChange={(a) => dispatch(setAccent(a))}
            />
          </View>
        </GroupedCard>

        <GroupedCard title="Security & preferences">
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>{biometricType} lock</Text>
              <Text style={styles.switchHint}>Require auth when reopening</Text>
            </View>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={async (v) => {
                if (v && !(await isBiometricAvailable())) {
                  Alert.alert('Unavailable', `${biometricType} is not set up.`);
                  return;
                }
                dispatch(setBiometricEnabled(v));
              }}
              disabled={!biometricSupported}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <ListRow
            icon="bell"
            label="Test push notification"
            onPress={async () => {
              try {
                const result = await apiPost<{ sent: number }>('/notifications/test', {});
                Alert.alert('Push', result.sent > 0 ? 'Sent!' : 'No token registered.');
              } catch {
                Alert.alert('Error', 'Failed to send');
              }
            }}
            isLast
          />
        </GroupedCard>

        <GroupedCard title="Profile">
          <ListRow
            icon="profile"
            label={editingProfile ? 'Cancel editing' : 'Edit profile'}
            onPress={() => setEditingProfile(!editingProfile)}
            isLast={false}
          />
          {!editingProfile ? (
            <>
              <ListRow icon="wallet" label="Currency" value={user?.currency ?? 'INR'} />
              <ListRow icon="profile" label="Country" value={user?.country ?? '—'} />
              <ListRow icon="chart" label="Plan" value={subscription?.role ?? user?.role ?? 'free'} isLast />
            </>
          ) : (
            <View style={{ padding: theme.spacing.lg }}>
              <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                <Input label="Name" value={value} onChangeText={onChange} />
              )} />
              <Controller control={control} name="country" render={({ field: { onChange, value } }) => (
                <Input label="Country" value={value} onChangeText={onChange} />
              )} />
              <Text style={styles.switchHint}>Currency</Text>
              <View style={styles.currencyRow}>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <Controller key={c} control={control} name="currency" render={({ field: { onChange, value } }) => (
                    <Pressable onPress={() => onChange(c)} style={[styles.currencyChip, value === c && styles.currencyChipActive]}>
                      <Text style={[styles.currencyText, value === c && styles.currencyTextActive]}>{c}</Text>
                    </Pressable>
                  )} />
                ))}
              </View>
              <Button title="Save profile" onPress={handleSubmit(saveProfile)} loading={profileLoading} />
            </View>
          )}
        </GroupedCard>

        <View style={styles.actions}>
          <Button title="Sign out" onPress={handleLogout} variant="outline" />
          <Button title="Delete account" onPress={handleDeleteAccount} variant="danger" />
        </View>
      </View>
    </Screen>
  );
}
