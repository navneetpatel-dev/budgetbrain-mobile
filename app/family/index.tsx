import { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Card } from '@/src/components/ui';
import { apiGet, apiPost } from '@/src/services/api';
import { useAppSelector } from '@/src/store/hooks';
import { COLORS } from '@/src/constants/config';
import type { FamilyMembership } from '@/src/types';

interface GroupForm {
  name: string;
}

interface JoinForm {
  inviteCode: string;
}

export default function FamilyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');
  const [loading, setLoading] = useState(false);

  const { data: memberships } = useQuery({
    queryKey: ['family-groups'],
    queryFn: () => apiGet<FamilyMembership[]>('/family/groups'),
    enabled: isPremium,
    retry: false,
  });

  const groupForm = useForm<GroupForm>({ defaultValues: { name: '' } });
  const joinForm = useForm<JoinForm>({ defaultValues: { inviteCode: '' } });

  if (!isPremium) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Family Accounts is Premium</Text>
        <Text style={styles.gateSubtitle}>Share budgets and track expenses together with family members</Text>
        <Button title="Upgrade to Premium" onPress={() => router.push('/subscription')} />
      </View>
    );
  }

  const createGroup = async (data: GroupForm) => {
    setLoading(true);
    try {
      await apiPost('/family/groups', data);
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      groupForm.reset();
      Alert.alert('Created', 'Family group created. Share the invite code with members.');
    } catch {
      Alert.alert('Error', 'Could not create group');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (data: JoinForm) => {
    setLoading(true);
    try {
      await apiPost('/family/join', data);
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      joinForm.reset();
      Alert.alert('Joined', 'You have joined the family group.');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      Alert.alert('Error', message ?? 'Could not join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  gate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.background },
  gateTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  gateSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  groupCard: { marginBottom: 12 },
  groupName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  groupRole: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  inviteCode: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginTop: 8 },
  formCard: { marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
});
