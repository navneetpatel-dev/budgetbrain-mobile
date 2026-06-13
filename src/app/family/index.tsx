import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, useScrollContentStyle, ScreenIntro, GroupedCard, EmptyState } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useFamilyGroups } from '@/features/family/hooks/useFamilyGroups';

export default function FamilyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { isPremium, memberships, loading, groupForm, joinForm, createGroup, joinGroup } = useFamilyGroups();

  if (!isPremium) {
    return (
      <View style={styles.gate}>
        <EmptyState
          icon="family"
          title="Family Accounts is Premium"
          subtitle="Share budgets and track expenses together with family members"
          action="Upgrade to Premium"
          onAction={() => router.push('/subscription')}
        />
      </View>
    );
  }

  const contentStyle = useScrollContentStyle();
  const groups = memberships ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <ScreenIntro eyebrow="SHARED" subtitle="Manage family groups and invite members" />

      {groups.map((m) => (
        <Card key={m.id} style={styles.groupCard}>
          <Text style={styles.groupName}>{m.group?.name ?? 'Family Group'}</Text>
          <Text style={styles.groupRole}>Role: {m.role}</Text>
          {m.group?.inviteCode && (
            <Text style={styles.inviteCode}>Invite: {m.group.inviteCode}</Text>
          )}
        </Card>
      ))}

      <GroupedCard title="CREATE GROUP">
        <Controller
          control={groupForm.control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Group Name" value={value} onChangeText={onChange} error={groupForm.formState.errors.name?.message} leftIcon="family" />
          )}
        />
        <Button title="Create Group" onPress={groupForm.handleSubmit(createGroup)} loading={loading} />
      </GroupedCard>

      <GroupedCard title="JOIN GROUP">
        <Controller
          control={joinForm.control}
          name="inviteCode"
          rules={{ required: 'Invite code is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Invite Code" value={value} onChangeText={onChange} autoCapitalize="characters" error={joinForm.formState.errors.inviteCode?.message} />
          )}
        />
        <Button title="Join Group" onPress={joinForm.handleSubmit(joinGroup)} variant="outline" loading={loading} />
      </GroupedCard>
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    gate: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: t.colors.background },
    groupCard: { marginBottom: 12 },
    groupName: { fontSize: 16, fontWeight: '700', color: t.colors.text },
    groupRole: { fontSize: 13, color: t.colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
    inviteCode: { fontSize: 14, color: t.colors.primary, fontWeight: '600', marginTop: 8 },
  });
}
