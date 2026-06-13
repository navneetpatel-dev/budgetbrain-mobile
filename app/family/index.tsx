import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, useScrollContentStyle } from '@/src/shared/components/ui';
import { useTheme } from '@/src/shared/theme';
import { useFamilyGroups } from '@/src/features/family/hooks/useFamilyGroups';

export default function FamilyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { isPremium, memberships, loading, groupForm, joinForm, createGroup, joinGroup } = useFamilyGroups();

  if (!isPremium) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Family Accounts is Premium</Text>
        <Text style={styles.gateSubtitle}>Share budgets and track expenses together with family members</Text>
        <Button title="Upgrade to Premium" onPress={() => router.push('/subscription')} />
      </View>
    );
  }

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Text style={styles.title}>Family Groups</Text>

      {memberships?.map((m) => (
        <Card key={m.id} style={styles.groupCard}>
          <Text style={styles.groupName}>{m.group?.name ?? 'Family Group'}</Text>
          <Text style={styles.groupRole}>Role: {m.role}</Text>
          {m.group?.inviteCode && (
            <Text style={styles.inviteCode}>Invite: {m.group.inviteCode}</Text>
          )}
        </Card>
      ))}

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Create Group</Text>
        <Controller
          control={groupForm.control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Group Name" value={value} onChangeText={onChange} error={groupForm.formState.errors.name?.message} />
          )}
        />
        <Button title="Create Group" onPress={groupForm.handleSubmit(createGroup)} loading={loading} />
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Join with Invite Code</Text>
        <Controller
          control={joinForm.control}
          name="inviteCode"
          rules={{ required: 'Invite code is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Invite Code" value={value} onChangeText={onChange} autoCapitalize="characters" error={joinForm.formState.errors.inviteCode?.message} />
          )}
        />
        <Button title="Join Group" onPress={joinForm.handleSubmit(joinGroup)} variant="outline" loading={loading} />
      </Card>
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    gate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: t.colors.background },
    gateTitle: { fontSize: 22, fontWeight: '800', color: t.colors.text, marginBottom: 8 },
    gateSubtitle: { fontSize: 15, color: t.colors.textSecondary, textAlign: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: t.colors.text, marginBottom: 16 },
    groupCard: { marginBottom: 12 },
    groupName: { fontSize: 16, fontWeight: '700', color: t.colors.text },
    groupRole: { fontSize: 13, color: t.colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
    inviteCode: { fontSize: 14, color: t.colors.primary, fontWeight: '600', marginTop: 8 },
    formCard: { marginBottom: 16 },
    formTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginBottom: 12 },
  });
}
