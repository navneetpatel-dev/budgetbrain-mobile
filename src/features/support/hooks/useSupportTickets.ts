import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { apiPost } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';

export interface TicketForm {
  subject: string;
  message: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export function useSupportTickets() {
  const [loading, setLoading] = useState(false);
  const { data: tickets, refetch } = usePaginatedList<SupportTicket, 'tickets'>({
    queryKey: ['support-tickets'],
    url: '/support',
    itemsKey: 'tickets',
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    defaultValues: { subject: '', message: '' },
  });

  const onSubmit = async (data: TicketForm) => {
    setLoading(true);
    try {
      await apiPost('/support', data);
      reset();
      await refetch();
      Alert.alert('Submitted', 'Our team will respond within 24–48 hours.');
    } catch {
      Alert.alert('Error', 'Could not submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    tickets,
    control,
    handleSubmit,
    errors,
    onSubmit,
  };
}
