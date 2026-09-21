import { useMemo, useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { appHref } from '@/shared/utils/navigation';
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
import { ThemePicker } from '@/features/settings/components/ThemePicker';
import { PinPadModal, type PinPadMode } from '@/features/settings/components/PinPadModal.component';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { PROFILE_FEATURE_LINKS, PROFILE_ACCOUNT_LINKS } from '@/features/settings/constants/profileLinks';
import { maxLen, textRules } from '@/shared/validation/fieldLimits';
import { useSettingsScreen } from '@/features/settings/hooks/useSettingsScreen.hook';
import { createStyles } from './SettingsScreen.styles';

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<PinPadMode>('set');

  const {
    user,
    themeMode,
    accent,
    setThemeMode,
    setAccentPalette,
    editingProfile,
    toggleEditingProfile,
    cancelEditingProfile,
    logout,
    deleteAccount,
    profileLoading,
    profileError,
    biometricType,
    biometricSupported,
    biometricEnabled,
    toggleBiometric,
    appLockPin,
    digestEnabled,
    toggleDigest,
    testPush,
    form,
    onSaveProfile,
  } = useSettingsScreen();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

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
        <View style={styles.appearanceBody}>
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
          <View style={styles.switchLabelCol}>
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
        <View style={styles.switchRow}>
          <View style={styles.switchLabelCol}>
            <Text style={styles.switchLabel}>Weekly spending digest</Text>
            <Text style={styles.switchHint}>Get a summary notification every Monday</Text>
          </View>
          <Switch
            value={digestEnabled}
            onValueChange={toggleDigest}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
        {appLockPin ? (
          <>
            <ListRow
              icon="lock"
              label="Change App Lock PIN"
              value="Configured"
              onPress={() => {
                setPinModalMode('change');
                setPinModalVisible(true);
              }}
            />
            <ListRow
              icon="trash"
              label="Remove App Lock PIN"
              onPress={() => {
                setPinModalMode('remove');
                setPinModalVisible(true);
              }}
            />
          </>
        ) : (
          <ListRow
            icon="lock"
            label="Set App Lock PIN"
            value="Not set"
            onPress={() => {
              setPinModalMode('set');
              setPinModalVisible(true);
            }}
          />
        )}
        <ListRow icon="bell" label="Test push notification" onPress={testPush} isLast />
      </GroupedCard>

      <GroupedCard title="Profile">
        <ListRow
          icon="profile"
          label={editingProfile ? 'Cancel editing' : 'Edit profile'}
          onPress={toggleEditingProfile}
          isLast={false}
        />
        {!editingProfile ? (
          <>
            <ListRow icon="wallet" label="Currency" value={user?.currency ?? 'INR'} />
            <ListRow icon="profile" label="Country" value={user?.country ?? '—'} isLast />
          </>
        ) : (
          <FormSection title="Edit profile" style={styles.editProfileSection}>
            {profileError ? <FormErrorBanner message={profileError} /> : null}
            <Controller
              control={control}
              name="name"
              rules={textRules('name')}
              render={({ field: { onChange, value } }) => (
                <Input label="Name" value={value} onChangeText={onChange} maxLength={maxLen('name')} error={errors.name?.message} leftIcon="personFill" disabled={profileLoading} />
              )}
            />
            <Controller
              control={control}
              name="country"
              rules={textRules('country')}
              render={({ field: { onChange, value } }) => (
                <Input label="Country" value={value} onChangeText={onChange} maxLength={maxLen('country')} error={errors.country?.message} disabled={profileLoading} />
              )}
            />
            <FormFieldLabel>Currency</FormFieldLabel>
            <Controller control={control} name="currency" render={({ field: { onChange, value } }) => (
              <OptionChips options={[...SUPPORTED_CURRENCIES]} value={value} onChange={onChange} disabled={profileLoading} />
            )} />
            <FormActions primaryTitle="Save profile" onPrimary={handleSubmit(onSaveProfile)} primaryLoading={profileLoading} secondaryTitle="Cancel" onSecondary={cancelEditingProfile} />
          </FormSection>
        )}
      </GroupedCard>

      <View style={styles.actions}>
        <Button title="Sign out" onPress={logout} variant="outline" size="lg" />
        <Button title="Delete account" onPress={deleteAccount} variant="danger" size="lg" />
      </View>

      <PinPadModal
        visible={pinModalVisible}
        mode={pinModalMode}
        onClose={() => setPinModalVisible(false)}
        onSuccess={() => setPinModalVisible(false)}
      />
    </StickyHeaderScreen>
  );
}
