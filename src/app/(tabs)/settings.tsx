import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Switch, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  GroupedCard,
  ListRow,
  StickyHeaderScreen,
} from '@/shared/components/ui';
import { ProfileHero } from '@/features/settings/components/ProfileHero';
import { PremiumUpsellCard } from '@/features/settings/components/PremiumUpsellCard';
import { ThemePicker } from '@/features/settings/components/ThemePicker';
import { useBiometricToggle } from '@/features/settings/hooks/useBiometricToggle';
import { useDeleteAccount } from '@/features/settings/hooks/useDeleteAccount';
import { useEditProfile, type ProfileForm } from '@/features/settings/hooks/useEditProfile';
import { useLogout } from '@/features/settings/hooks/useLogout';
import { usePushTest } from '@/features/settings/hooks/usePushTest';
import { apiGet } from '@/shared/services/api';
import { setTheme, setAccent } from '@/shared/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { SUBSCRIPTION_PLANS, SUPPORTED_CURRENCIES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import type { AppIconName } from '@/features/navigation/components/AppIcon';

const FEATURE_LINKS: { label: string; href: string; icon: AppIconName }[] = [
  { label: 'Goals', href: '/(tabs)/goals', icon: 'goals' },
  { label: 'Income', href: '/(tabs)/income', icon: 'income' },
  { label: 'AI Insights', href: '/(tabs)/ai', icon: 'ai' },
  { label: 'Net Worth', href: '/net-worth', icon: 'netWorth' },
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
  const { screenPaddingX } = useResponsive();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const settings = useAppSelector((s) => s.settings);
  const [editingProfile, setEditingProfile] = useState(false);

  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const { save: saveProfile, loading: profileLoading } = useEditProfile();
  const { type: biometricType, supported: biometricSupported, enabled: biometricEnabled, toggle: toggleBiometric } = useBiometricToggle();
  const testPush = usePushTest();

  const { control, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' },
  });

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
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 44,
          justifyContent: 'center',
          borderRadius: theme.radii.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        currencyChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
        currencyText: { ...theme.typography.bodyMedium, fontSize: 14, color: theme.colors.text },
        currencyTextActive: { color: theme.colors.onPrimary, fontWeight: '600' },
        actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
      }),
    [theme],
  );

  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');

  const onSaveProfile = async (data: ProfileForm) => {
    const ok = await saveProfile(data);
    if (ok) setEditingProfile(false);
  };

  return (
    <StickyHeaderScreen
      header={
        <ProfileHero
          name={user?.name ?? 'User'}
          email={user?.email}
          role={user?.role}
          currency={user?.currency}
          onEditPress={() => setEditingProfile((v) => !v)}
        />
      }
      contentContainerStyle={{ paddingHorizontal: screenPaddingX }}
    >
        {!isPremium && <PremiumUpsellCard />}

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
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              disabled={!biometricSupported}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <ListRow
            icon="bell"
            label="Test push notification"
            onPress={testPush}
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
              <Button title="Save profile" onPress={handleSubmit(onSaveProfile)} loading={profileLoading} />
            </View>
          )}
        </GroupedCard>

        <View style={styles.actions}>
          <Button title="Sign out" onPress={logout} variant="outline" />
          <Button title="Delete account" onPress={deleteAccount} variant="danger" />
        </View>
    </StickyHeaderScreen>
  );
}
