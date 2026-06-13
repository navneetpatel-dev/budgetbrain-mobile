import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { apiPost, apiGet } from '@/src/shared/services/api';

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
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    defaultValues: { subject: '', message: '' },
  });

  const loadTickets = async () => {
    try {
      const data = await apiGet<SupportTicket[]>('/support');
      setTickets(data);
    } catch {
      // ignore on first load
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const onSubmit = async (data: TicketForm) => {
    setLoading(true);
    try {
      await apiPost('/support', data);
      reset();
      await loadTickets();
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
