import { useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiPost } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useAppSelector } from '@/shared/store/hooks';
import type { FamilyMembership } from '@/shared/types';

export interface GroupForm {
  name: string;
}

export interface JoinForm {
  inviteCode: string;
}

export function useFamilyGroups() {
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');
  const [loading, setLoading] = useState(false);

  const { data: memberships } = usePaginatedList<FamilyMembership, 'memberships'>({
    queryKey: ['family-groups'],
    url: '/family/groups',
    itemsKey: 'memberships',
    enabled: isPremium,
  });

  const groupForm = useForm<GroupForm>({ defaultValues: { name: '' } });
  const joinForm = useForm<JoinForm>({ defaultValues: { inviteCode: '' } });

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

  return {
    isPremium,
    memberships,
    loading,
    groupForm,
    joinForm,
    createGroup,
    joinGroup,
  };
}
