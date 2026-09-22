import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, FormFieldLabel, FormErrorBanner, FormSuccessBanner, ActionSheet } from '@/shared/components/ui';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useFamilyGroups } from '@/features/family/hooks/useFamilyGroups.hook';
import { useSettleSplit } from '@/features/family/hooks/useSettleSplit.hook';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { FamilyMemberWithUser, SplitParticipant } from '@/shared/types';
import { createStyles } from './SplitExpenseSection.styles';

/**
 * Split-with-family action for a single expense. Only supports splitting from the expense
 * detail screen (after the expense already exists) — keeps the create-expense flow simple.
 * The split rows shown here (and their settle buttons) are the ones just created in this
 * session; to settle older splits later, use the Balances section on the Family screen.
 */
export function SplitExpenseSection({
  transactionId,
  amount,
  currency,
}: {
  transactionId: string;
  amount: number;
  currency: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { memberships } = useFamilyGroups();
  const [open, setOpen] = useState(false);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<SplitParticipant[] | null>(null);
  const [settledIds, setSettledIds] = useState<Set<string>>(new Set());

  const writableGroups = (memberships ?? []).filter((g) => g.role !== 'read_only');
  const groups = writableGroups;
  const activeGroupId = groupId ?? groups[0]?.groupId ?? null;
  const activeRole = groups.find((g) => g.groupId === activeGroupId)?.role;
  const canSettle = activeRole !== 'read_only';
  const { settle: settleSplit, settlingId } = useSettleSplit(activeGroupId ?? undefined);

  const { data: membersData } = useQuery({
    queryKey: ['family-members', activeGroupId],
    queryFn: () => apiGet<{ members: FamilyMemberWithUser[] }>(`/family/groups/${activeGroupId}/members`),
    enabled: !!activeGroupId && open,
  });
  const members = membersData?.members ?? [];

  if (groups.length === 0) return null;

  const startSplit = () => {
    setOpen(true);
    setCreated(null);
    setError(null);
    if (!groupId && groups[0]) setGroupId(groups[0].groupId);
  };

  const toggleMember = (userId: string, share: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[userId] !== undefined) {
        delete next[userId];
      } else {
        next[userId] = String(share);
      }
      return next;
    });
  };

  const participantIds = Object.keys(selected);
  const equalShare = participantIds.length > 0 ? amount / participantIds.length : 0;

  const submit = async () => {
    if (!activeGroupId || participantIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const participants = participantIds.map((userId) => ({
        userId,
        shareAmount: Number(selected[userId] || equalShare.toFixed(2)),
      }));
      const rows = await apiPost<SplitParticipant[]>(`/family/groups/${activeGroupId}/splits`, {
        transactionId,
        participants,
      });
      setCreated(rows);
      setSelected({});
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not split expense'));
    } finally {
      setLoading(false);
    }
  };

  const settle = async (id: string) => {
    await settleSplit(id);
    setSettledIds((prev) => new Set(prev).add(id));
  };

  return (
    <View style={styles.wrap}>
      {!open ? (
        <Button title="Split with family" variant="outline" onPress={startSplit} />
      ) : (
        <View style={styles.panel}>
          <View style={styles.headerRow}>
            <FormFieldLabel>Split with family</FormFieldLabel>
            {groups.length > 1 ? (
              <Pressable onPress={() => setGroupPickerOpen(true)}>
                <Text style={styles.groupPicker}>
                  {groups.find((g) => g.groupId === activeGroupId)?.group?.name ?? 'Choose group'} ›
                </Text>
              </Pressable>
            ) : null}
          </View>

          {error ? <FormErrorBanner message={error} /> : null}

          {created ? (
            <View>
              <FormSuccessBanner message="Split created" />
              {created.map((row) => (
                <View key={row.id} style={styles.resultRow}>
                  <Text style={styles.resultText}>
                    {members.find((m) => m.userId === row.userId)?.user.name ?? 'Member'} owes{' '}
                    {formatCurrency(row.shareAmount, currency)}
                  </Text>
                  {settledIds.has(row.id) ? (
                    <Text style={styles.settledText}>Settled</Text>
                  ) : canSettle ? (
                    <Pressable onPress={() => settle(row.id)}>
                      <Text style={styles.settleAction}>Mark settled</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <>
              {members
                .filter((m) => m.userId)
                .map((m) => {
                  const isSelected = selected[m.userId] !== undefined;
                  return (
                    <Pressable
                      key={m.id}
                      style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                      onPress={() => toggleMember(m.userId, equalShare || amount)}
                    >
                      <Text style={styles.memberName}>{m.user.name ?? m.user.email}</Text>
                      {isSelected ? (
                        <TextInput
                          value={selected[m.userId]}
                          onChangeText={(v) => setSelected((prev) => ({ ...prev, [m.userId]: v }))}
                          keyboardType="numeric"
                          style={styles.shareInput}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              <View style={styles.actionsRow}>
                <Button
                  title="Create split"
                  onPress={submit}
                  loading={loading}
                  disabled={participantIds.length === 0}
                  size="md"
                />
                <Button title="Cancel" variant="outline" onPress={() => setOpen(false)} />
              </View>
            </>
          )}
        </View>
      )}

      <ActionSheet
        visible={groupPickerOpen}
        title="Choose group"
        onClose={() => setGroupPickerOpen(false)}
        items={groups.map((g) => ({
          id: g.groupId,
          label: g.group?.name ?? 'Family group',
          onPress: () => setGroupId(g.groupId),
        }))}
      />
    </View>
  );
}
