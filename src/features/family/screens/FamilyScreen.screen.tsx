import { useMemo, useState } from 'react';
import { RefreshControl, Text, View, Pressable } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Input,
  Card,
  StackScrollScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
  FormSuccessBanner,
  FamilySkeleton,
  ActionSheet,
  FormModal,
  OptionChips,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader.component';
import { useTheme } from '@/shared/theme';
import { useFamilyGroups } from '@/features/family/hooks/useFamilyGroups.hook';
import { useSettleSplit } from '@/features/family/hooks/useSettleSplit.hook';
import { useFamilyInvite, type FamilyInviteForm, type FamilyInviteRole } from '@/features/family/hooks/useFamilyInvite.hook';
import { apiGet, apiDelete, apiPatch } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import { formatCurrency } from '@/shared/utils/currency';
import { useAppSelector } from '@/shared/store/hooks';
import { inviteCodeRules, maxLen, textRules } from '@/shared/validation/fieldLimits';
import { showConfirmation } from '@/shared/utils/confirmations';
import { CONFIRM } from '@/shared/constants/confirmations';
import type { FamilyBalance, FamilyMemberWithUser, SplitWithTransaction } from '@/shared/types';
import { createStyles } from './FamilyScreen.styles';

const INVITE_ROLE_OPTIONS: FamilyInviteRole[] = ['admin', 'contributor', 'read_only'];
const INVITE_ROLE_LABELS: Record<FamilyInviteRole, string> = {
  admin: 'Admin',
  contributor: 'Contributor',
  read_only: 'Read Only',
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GroupBalances({ groupId, currency, userRole }: { groupId: string; currency: string; userRole: string }) {
  const theme = useTheme();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const { data } = useQuery({
    queryKey: ['family-balances', groupId],
    queryFn: () => apiGet<{ balances: FamilyBalance[] }>(`/family/groups/${groupId}/balances`),
  });
  const { data: membersData } = useQuery({
    queryKey: ['family-members', groupId],
    queryFn: () => apiGet<{ members: FamilyMemberWithUser[] }>(`/family/groups/${groupId}/members`),
  });
  const { data: splits } = usePaginatedList<SplitWithTransaction, 'splits'>({
    queryKey: ['family-splits', groupId],
    url: `/family/groups/${groupId}/splits`,
    itemsKey: 'splits',
  });
  const { settleMany, settlingId, error: settleError } = useSettleSplit(groupId);
  const canSettle = userRole !== 'read_only';

  const balances = data?.balances ?? [];
  const members = membersData?.members ?? [];
  const nameFor = (userId: string) =>
    userId === currentUserId ? 'You' : members.find((m) => m.userId === userId)?.user.name ?? 'Member';

  if (balances.length === 0) return null;

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      {settleError ? <FormErrorBanner message={settleError} /> : null}
      {balances.map((b, i) => {
        const matchingSplitIds = splits
          .filter((s) => s.userId === b.fromUserId && s.transaction.userId === b.toUserId && !s.settled)
          .map((s) => s.id);
        const isSettling = matchingSplitIds.some((id) => id === settlingId);

        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, flex: 1 }}>
              {nameFor(b.fromUserId)} owes {nameFor(b.toUserId)} {formatCurrency(b.amount, currency)}
            </Text>
            {matchingSplitIds.length > 0 && canSettle ? (
              <Pressable onPress={() => settleMany(matchingSplitIds)} disabled={isSettling} hitSlop={8}>
                <Text style={{ ...theme.typography.caption, fontWeight: '700', color: theme.colors.primary }}>
                  {isSettling ? 'Settling…' : 'Settle up'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function GroupMembersList({
  groupId,
  groupName,
  userRole,
  currentUserId,
}: {
  groupId: string;
  groupName: string;
  userRole: string;
  currentUserId?: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['family-members', groupId],
    queryFn: () => apiGet<{ members: FamilyMemberWithUser[] }>(`/family/groups/${groupId}/members`),
  });

  const [roleSheetMember, setRoleSheetMember] = useState<FamilyMemberWithUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const invite = useFamilyInvite(groupId);
  const inviteForm = useForm<FamilyInviteForm>({ defaultValues: { invitedEmail: '', role: 'contributor' } });

  const members = data?.members ?? [];
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

  const closeInviteModal = () => {
    setInviteOpen(false);
    invite.reset();
    inviteForm.reset({ invitedEmail: '', role: 'contributor' });
  };

  const submitInvite = async (data: FamilyInviteForm) => {
    const sent = await invite.sendInvite(data);
    if (sent) {
      inviteForm.reset({ invitedEmail: '', role: 'contributor' });
    }
  };

  const handleRemoveMember = (member: FamilyMemberWithUser) => {
    showConfirmation(CONFIRM.removeFamilyMember(member.user.name ?? 'Member'), async () => {
      await apiDelete(`/family/groups/${groupId}/members/${member.userId}`);
      void queryClient.invalidateQueries({ queryKey: ['family-members', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['family-groups'] });
    });
  };

  const applyRoleChange = (member: FamilyMemberWithUser, newRole: 'admin' | 'contributor' | 'read_only' | 'owner') => {
    const run = async () => {
      await apiPatch(`/family/groups/${groupId}/members/${member.userId}`, { role: newRole });
      void queryClient.invalidateQueries({ queryKey: ['family-members', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['family-groups'] });
    };
    if (newRole === 'owner') {
      showConfirmation(CONFIRM.transferFamilyOwnership(member.user.name ?? 'Member'), run);
    } else {
      void run();
    }
  };

  const handleDeleteGroup = () => {
    showConfirmation(CONFIRM.deleteFamilyGroup(groupName), async () => {
      await apiDelete(`/family/groups/${groupId}`);
      void queryClient.invalidateQueries({ queryKey: ['family-groups'] });
    });
  };

  return (
    <View style={styles.membersSection}>
      <Text style={styles.membersSectionTitle}>Members ({members.length})</Text>
      {members.map((member) => {
        const isSelf = member.userId === currentUserId;
        const canRemove =
          !isSelf &&
          (userRole === 'owner' || (userRole === 'admin' && member.role !== 'owner' && member.role !== 'admin'));
        const canChangeRole = userRole === 'owner' && !isSelf;

        return (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.memberLeft}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitials}>
                  {(member.user.name?.[0] ?? member.user.email[0] ?? 'M').toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.memberName}>
                  {member.user.name ?? member.user.email}
                  {isSelf ? ' (You)' : ''}
                </Text>
                <Text style={styles.memberRoleText}>{member.role}</Text>
              </View>
            </View>

            <View style={styles.memberActionsRow}>
              {canChangeRole ? (
                <Pressable onPress={() => setRoleSheetMember(member)} hitSlop={8}>
                  <Text style={styles.memberRoleAction}>Change role</Text>
                </Pressable>
              ) : null}
              {canRemove ? (
                <Pressable
                  onPress={() => handleRemoveMember(member)}
                  style={styles.memberRemoveBtn}
                  hitSlop={8}
                >
                  <Text style={styles.memberRemoveText}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}

      {isOwnerOrAdmin ? (
        <View style={styles.groupActionsRow}>
          <Pressable onPress={() => setInviteOpen(true)} hitSlop={8}>
            <Text style={styles.memberRoleAction}>Invite by email</Text>
          </Pressable>
          {userRole === 'owner' ? (
            <Pressable onPress={handleDeleteGroup} style={styles.deleteGroupBtn} hitSlop={8}>
              <Text style={styles.deleteGroupText}>Delete Group</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <FormModal
        visible={inviteOpen}
        title="Invite by email"
        subtitle={`Invite someone to "${groupName}" — they'll get an email even if they don't have an account yet.`}
        onClose={closeInviteModal}
        footer={
          <FormActions
            primaryTitle="Send Invite"
            onPrimary={inviteForm.handleSubmit(submitInvite)}
            primaryLoading={invite.loading}
          />
        }
      >
        <Controller
          control={inviteForm.control}
          name="invitedEmail"
          rules={{
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoComplete="email"
              placeholder="member@example.com"
              error={inviteForm.formState.errors.invitedEmail?.message}
              disabled={invite.loading}
            />
          )}
        />
        <Controller
          control={inviteForm.control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <OptionChips
              options={INVITE_ROLE_OPTIONS}
              value={value}
              onChange={onChange}
              getLabel={(v) => INVITE_ROLE_LABELS[v]}
              disabled={invite.loading}
            />
          )}
        />
        {invite.error ? <FormErrorBanner message={invite.error} /> : null}
        {invite.success ? <FormSuccessBanner message={invite.success} /> : null}
      </FormModal>

      <ActionSheet
        visible={!!roleSheetMember}
        title={roleSheetMember ? `Change role for ${roleSheetMember.user.name ?? 'Member'}` : ''}
        onClose={() => setRoleSheetMember(null)}
        items={
          roleSheetMember
            ? (['admin', 'contributor', 'read_only', 'owner'] as const)
                .filter((r) => r !== roleSheetMember.role)
                .map((r) => ({
                  id: r,
                  label: r === 'owner' ? 'Transfer ownership' : r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' '),
                  onPress: () => {
                    applyRoleChange(roleSheetMember, r);
                    setRoleSheetMember(null);
                  },
                }))
            : []
        }
      />
    </View>
  );
}

export function FamilyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    memberships,
    isLoading,
    isRefetching,
    refetch,
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
  const user = useAppSelector((s) => s.auth.user);

  const groups = memberships ?? [];

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="family"
          subtitle="Manage groups and invite members"
        />
      }
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      {isLoading ? <FamilySkeleton /> : null}
      {!isLoading && groups.length > 0 && (
        <FormSection title="Your groups" subtitle={`${groups.length} group${groups.length !== 1 ? 's' : ''}`}>
          {groups.map((m) => {
            const isOwner = m.role === 'owner';
            const isAdmin = m.role === 'admin';
            return (
              <Card key={m.id} style={styles.groupCard}>
                <View style={styles.headerRow}>
                  <Text style={styles.groupName}>{m.group?.name ?? 'Family Group'}</Text>
                  <View
                    style={[
                      styles.roleBadge,
                      isOwner && styles.roleBadgeOwner,
                      isAdmin && styles.roleBadgeAdmin,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        isOwner && styles.roleBadgeTextOwner,
                        isAdmin && styles.roleBadgeTextAdmin,
                      ]}
                    >
                      {m.role}
                    </Text>
                  </View>
                </View>
                {m.group?.inviteCode ? (
                  <Text style={styles.inviteCode}>Invite: {m.group.inviteCode}</Text>
                ) : null}
                <GroupBalances groupId={m.groupId} currency={user?.currency ?? 'INR'} userRole={m.role} />
                <GroupMembersList
                  groupId={m.groupId}
                  groupName={m.group?.name ?? 'Family Group'}
                  userRole={m.role}
                  currentUserId={user?.id}
                />
              </Card>
            );
          })}
        </FormSection>
      )}

      {!isLoading && (
        <>
          <FormSection title="Create group" subtitle="Start a new family group">
            <Controller
              control={groupForm.control}
              name="name"
              rules={textRules('entityName')}
              render={({ field: { onChange, value } }) => (
                <Input label="Group name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={groupForm.formState.errors.name?.message} leftIcon="family" placeholder="e.g. Smith Family" disabled={loading} />
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
              rules={inviteCodeRules()}
              render={({ field: { onChange, value } }) => (
                <Input label="Invite code" maxLength={maxLen('inviteCode')} value={value} onChangeText={onChange} autoCapitalize="characters" error={joinForm.formState.errors.inviteCode?.message} leftIcon="link" placeholder="ABC123" disabled={loading} />
              )}
            />
            {joinError ? <FormErrorBanner message={joinError} /> : null}
            {joinSuccess ? <FormSuccessBanner message={joinSuccess} /> : null}
            <FormActions primaryTitle="Join Group" onPrimary={joinForm.handleSubmit(joinGroup)} primaryLoading={loading} />
          </FormSection>
        </>
      )}
    </StackScrollScreen>
  );
}

