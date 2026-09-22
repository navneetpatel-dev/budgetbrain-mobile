import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const clearFeedback = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(null);
  }, []);

  const { data: tickets, isLoading, isRefetching, refetch } = usePaginatedList<SupportTicket, 'tickets'>({
    queryKey: ['support-tickets'],
    url: '/support',
    itemsKey: 'tickets',
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    defaultValues: { subject: '', message: '' },
  });

  const onSubmit = async (data: TicketForm) => {
    setLoading(true);
    clearFeedback();
    try {
      await apiPost('/support', data);
      reset();
      await refetch();
      setSubmitSuccess('Our team will respond within 24–48 hours.');
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not submit ticket'));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isLoading,
    isRefetching,
    refetch,
    tickets,
    control,
    handleSubmit,
    errors,
    onSubmit,
    submitError,
    submitSuccess,
    clearFeedback,
  };
}
