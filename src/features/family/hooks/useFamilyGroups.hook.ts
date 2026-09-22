import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import type { FamilyMembership } from '@/shared/types';

export interface GroupForm {
  name: string;
}

export interface JoinForm {
  inviteCode: string;
}

export function useFamilyGroups() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const clearCreateFeedback = useCallback(() => {
    setCreateError(null);
    setCreateSuccess(null);
  }, []);
  const clearJoinFeedback = useCallback(() => {
    setJoinError(null);
    setJoinSuccess(null);
  }, []);

  const { data: memberships, isLoading, isRefetching, refetch } = usePaginatedList<FamilyMembership, 'memberships'>({
    queryKey: ['family-groups'],
    url: '/family/groups',
    itemsKey: 'memberships',
  });

  const groupForm = useForm<GroupForm>({ defaultValues: { name: '' } });
  const joinForm = useForm<JoinForm>({ defaultValues: { inviteCode: '' } });

  const createGroup = async (data: GroupForm) => {
    setLoading(true);
    clearCreateFeedback();
    try {
      await apiPost('/family/groups', data);
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      groupForm.reset();
      setCreateSuccess('Family group created. Share the invite code with members.');
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'Could not create group'));
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (data: JoinForm) => {
    setLoading(true);
    clearJoinFeedback();
    try {
      await apiPost('/family/join', data);
      queryClient.invalidateQueries({ queryKey: ['family-groups'] });
      joinForm.reset();
      setJoinSuccess('You have joined the family group.');
    } catch (err) {
      setJoinError(getApiErrorMessage(err, 'Could not join group'));
    } finally {
      setLoading(false);
    }
  };

  return {
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
    clearCreateFeedback,
    clearJoinFeedback,
  };
}
