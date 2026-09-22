import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deleteReceipt, fetchAttachmentSuggestion, fetchAttachments } from '@/features/expenses/api/receipts.api';
import type { ReceiptExtraction } from '@/features/expenses/types/expenses.types';

export function useExpenseAttachments(expenseId: string | undefined) {
  const { data: attachments = [] , refetch: refetchAttachments } = useQuery({
    queryKey: ['expense-attachments', expenseId],
    queryFn: () => (expenseId ? fetchAttachments(expenseId) : Promise.resolve([])),
    enabled: !!expenseId,
  });

  const [checkingSuggestionId, setCheckingSuggestionId] = useState<string | null>(null);
  const [suggestionNotReadyId, setSuggestionNotReadyId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ attachmentId: string; data: ReceiptExtraction } | null>(null);

  const deleteAttachment = useCallback(async (attachmentId: string) => {
    if (!expenseId) return;
    try {
      await deleteReceipt(expenseId, attachmentId);
      refetchAttachments();
    } catch (err) {
      console.error('Failed to delete attachment', err);
    }
  }, [expenseId, refetchAttachments]);

  const checkSuggestion = useCallback(async (attachmentId: string) => {
    if (!expenseId) return;
    setSuggestionNotReadyId(null);
    setCheckingSuggestionId(attachmentId);
    try {
      const result = await fetchAttachmentSuggestion(expenseId, attachmentId);
      if (result && (result.merchant || result.amount !== undefined || result.date)) {
        setSuggestion({ attachmentId, data: result });
      } else {
        setSuggestionNotReadyId(attachmentId);
      }
    } catch (err) {
      console.error('Failed to fetch receipt suggestion', err);
      setSuggestionNotReadyId(attachmentId);
    } finally {
      setCheckingSuggestionId(null);
    }
  }, [expenseId]);

  const dismissSuggestion = useCallback(() => setSuggestion(null), []);

  return {
    attachments,
    suggestion,
    dismissSuggestion,
    checkingSuggestionId,
    suggestionNotReadyId,
    checkSuggestion,
    deleteAttachment,
  };
}
