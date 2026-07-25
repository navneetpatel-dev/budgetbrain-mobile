import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import {
  Input,
  Card,
  StackScrollScreen,
  EmptyState,
  FormSection,
  FormActions,
  FormErrorBanner,
  FormSuccessBanner,
  FormInfoBanner,
  FamilySkeleton,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useFamilyGroups } from '@/features/family/hooks/useFamilyGroups';

export default function FamilyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const {
    isPremium,
    memberships,
    isLoading,
    loading,
    groupForm,
    joinForm,
    createGroup,
    joinGroup,
    createError,
    joinError,
    createSuccess,
    joinSuccess,
  } = useFamilyGroups();

  if (!isPremium) {
    return (
      <StackScrollScreen
        header={
          <ProfileStackHeader
            screen="family"
            subtitle="Share budgets with family members"
          />
        }
      >
        <EmptyState
          icon="family"
          title="Family Accounts is Premium"
          subtitle="Share budgets and track expenses together with family members"
          action="Upgrade to Premium"
          onAction={() => router.push('/subscription')}
        />
      </StackScrollScreen>
    );
  }

  if (isLoading) return <FamilySkeleton />;

  const groups = memberships ?? [];

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="family"
          subtitle="Manage groups and invite members"
        />
      }
    >
      {groups.length > 0 && (
        <FormSection title="Your groups" subtitle={`${groups.length} group${groups.length !== 1 ? 's' : ''}`}>
          {groups.map((m) => (
            <Card key={m.id} style={styles.groupCard}>
              <Text style={styles.groupName}>{m.group?.name ?? 'Family Group'}</Text>
              <Text style={styles.groupRole}>Role: {m.role}</Text>
              {m.group?.inviteCode ? (
                <Text style={styles.inviteCode}>Invite: {m.group.inviteCode}</Text>
              ) : null}
            </Card>
          ))}
        </FormSection>
      )}

      <FormSection title="Create group" subtitle="Start a new family group">
        <Controller
          control={groupForm.control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Group name" value={value} onChangeText={onChange} error={groupForm.formState.errors.name?.message} leftIcon="family" placeholder="e.g. Smith Family" disabled={loading} />
          )}
        />
        {createError ? <FormErrorBanner message={createError} /> : null}
        {createSuccess ? <FormSuccessBanner message={createSuccess} /> : null}
        <FormActions primaryTitle="Create Group" onPrimary={groupForm.handleSubmit(createGroup)} primaryLoading={loading} />
      </FormSection>

      <FormSection title="Join group" subtitle="Enter an invite code from a member">
        <Controller
          control={joinForm.control}
          name="inviteCode"
          rules={{ required: 'Invite code is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Invite code" value={value} onChangeText={onChange} autoCapitalize="characters" error={joinForm.formState.errors.inviteCode?.message} leftIcon="link" placeholder="ABC123" disabled={loading} />
          )}
        />
        {joinError ? <FormErrorBanner message={joinError} /> : null}
        {joinSuccess ? <FormSuccessBanner message={joinSuccess} /> : null}
        <FormActions primaryTitle="Join Group" onPrimary={joinForm.handleSubmit(joinGroup)} primaryLoading={loading} />
      </FormSection>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    groupCard: { marginBottom: t.spacing.sm },
    groupName: { fontSize: 16, fontWeight: '700', color: t.colors.text },
    groupRole: { fontSize: 13, color: t.colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
    inviteCode: { fontSize: 14, color: t.colors.primary, fontWeight: '600', marginTop: 8 },
  });
}
