import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
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
  FormSection,
  FormFieldLabel,
  OptionChips,
  FormActions,
  FormErrorBanner,
  SettingsSkeleton,
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
import { useSyncedPreferences } from '@/features/settings/hooks/useSyncedPreferences';
import { useAppSelector } from '@/shared/store/hooks';
import { SUBSCRIPTION_PLANS, SUPPORTED_CURRENCIES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { PROFILE_FEATURE_LINKS, PROFILE_ACCOUNT_LINKS } from '@/features/settings/constants/profileLinks';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const { theme: themeMode, accent, setThemeMode, setAccentPalette } = useSyncedPreferences();
  const [editingProfile, setEditingProfile] = useState(false);

  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const { save: saveProfile, loading: profileLoading, submitError: profileError, clearSubmitError } = useEditProfile();
  const { type: biometricType, supported: biometricSupported, enabled: biometricEnabled, toggle: toggleBiometric } = useBiometricToggle();
  const testPush = usePushTest();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
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
        actions: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
      }),
    [theme],
  );

  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');

  const onSaveProfile = async (data: ProfileForm) => {
    const ok = await saveProfile(data);
    if (ok) setEditingProfile(false);
  };

  if (!user) return <SettingsSkeleton />;

  return (
    <StickyHeaderScreen
      header={
        <ProfileHero
          name={user.name ?? 'User'}
          email={user.email}
          role={user.role}
          currency={user.currency}
        />
      }
    >
        {!isPremium && <PremiumUpsellCard />}

        <GroupedCard title="Features">
          {PROFILE_FEATURE_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => router.push(appHref(link.href))}
              isLast={i === PROFILE_FEATURE_LINKS.length - 1}
            />
          ))}
        </GroupedCard>

        <GroupedCard title="Account">
          {PROFILE_ACCOUNT_LINKS.map((link, i) => (
            <ListRow
              key={link.href}
              icon={link.icon}
              label={link.label}
              onPress={() => router.push(appHref(link.href))}
              isLast={i === PROFILE_ACCOUNT_LINKS.length - 1}
            />
          ))}
        </GroupedCard>

        <GroupedCard title="Appearance">
          <View style={{ padding: theme.spacing.lg }}>
            <ThemePicker
              mode={themeMode}
              accent={accent}
              onModeChange={setThemeMode}
              onAccentChange={setAccentPalette}
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
            onPress={() => {
              if (editingProfile) clearSubmitError();
              setEditingProfile(!editingProfile);
            }}
            isLast={false}
          />
          {!editingProfile ? (
            <>
              <ListRow icon="wallet" label="Currency" value={user?.currency ?? 'INR'} />
              <ListRow icon="profile" label="Country" value={user?.country ?? '—'} />
              <ListRow icon="chart" label="Plan" value={subscription?.role ?? user?.role ?? 'free'} isLast />
            </>
          ) : (
            <FormSection title="Edit profile" style={{ margin: theme.spacing.lg, marginTop: 0 }}>
              {profileError ? <FormErrorBanner message={profileError} /> : null}
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required', maxLength: { value: 255, message: 'Name must be at most 255 characters' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Name" value={value} onChangeText={onChange} maxLength={255} error={errors.name?.message} leftIcon="personFill" disabled={profileLoading} />
                )}
              />
              <Controller
                control={control}
                name="country"
                rules={{ required: 'Country is required', maxLength: { value: 100, message: 'Country must be at most 100 characters' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Country" value={value} onChangeText={onChange} maxLength={100} error={errors.country?.message} disabled={profileLoading} />
                )}
              />
              <FormFieldLabel>Currency</FormFieldLabel>
              <Controller control={control} name="currency" render={({ field: { onChange, value } }) => (
                <OptionChips options={[...SUPPORTED_CURRENCIES]} value={value} onChange={onChange} disabled={profileLoading} />
              )} />
              <FormActions primaryTitle="Save profile" onPrimary={handleSubmit(onSaveProfile)} primaryLoading={profileLoading} secondaryTitle="Cancel" onSecondary={() => setEditingProfile(false)} />
            </FormSection>
          )}
        </GroupedCard>

        <View style={styles.actions}>
          <Button title="Sign out" onPress={logout} variant="outline" />
          <Button title="Delete account" onPress={deleteAccount} variant="danger" />
        </View>
    </StickyHeaderScreen>
  );
}
