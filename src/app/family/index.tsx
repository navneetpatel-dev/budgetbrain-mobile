import { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Input,
  Card,
  StackScrollScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
  FormSuccessBanner,
  FamilySkeleton,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useFamilyGroups } from '@/features/family/hooks/useFamilyGroups';
import { useSettleSplit } from '@/features/family/hooks/useSettleSplit';
import { apiGet } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { formatCurrency } from '@/shared/utils/currency';
import { useAppSelector } from '@/shared/store/hooks';
import { inviteCodeRules, maxLen, textRules } from '@/shared/validation/fieldLimits';
import type { FamilyBalance, FamilyMemberWithUser, SplitWithTransaction } from '@/shared/types';

function GroupBalances({ groupId, currency }: { groupId: string; currency: string }) {
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
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, flex: 1 }}>
              {nameFor(b.fromUserId)} owes {nameFor(b.toUserId)} {formatCurrency(b.amount, currency)}
            </Text>
            {matchingSplitIds.length > 0 ? (
              <Pressable onPress={() => settleMany(matchingSplitIds)} disabled={isSettling} hitSlop={8}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
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

export default function FamilyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
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
    >
      {isLoading ? <FamilySkeleton /> : null}
      {!isLoading && groups.length > 0 && (
        <FormSection title="Your groups" subtitle={`${groups.length} group${groups.length !== 1 ? 's' : ''}`}>
          {groups.map((m) => (
            <Card key={m.id} style={styles.groupCard}>
              <Text style={styles.groupName}>{m.group?.name ?? 'Family Group'}</Text>
              <Text style={styles.groupRole}>Role: {m.role}</Text>
              {m.group?.inviteCode ? (
                <Text style={styles.inviteCode}>Invite: {m.group.inviteCode}</Text>
              ) : null}
              <GroupBalances groupId={m.groupId} currency={user?.currency ?? 'INR'} />
            </Card>
          ))}
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    groupCard: { marginBottom: t.spacing.sm },
    groupName: { fontSize: 16, fontWeight: '700', color: t.colors.text },
    groupRole: { fontSize: 13, color: t.colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
    inviteCode: { fontSize: 14, color: t.colors.primary, fontWeight: '600', marginTop: 8 },
  });
}
