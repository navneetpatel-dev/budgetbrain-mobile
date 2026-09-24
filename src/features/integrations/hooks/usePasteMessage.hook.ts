import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { fetchInstitutions, ingestMessage } from '../api/ingest.api';
import type { PasteKind } from '../types/ingest.types';
import { ingestOutcome } from '../utils/ingestMessages';

/**
 * Paste a bank SMS or email (plan T6.2). The server reads it with the same parser the phone
 * uses and keeps only the extracted fields. When it can't tell the bank, the user picks it.
 */
export function usePasteMessage() {
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<PasteKind>('sms');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [needsBank, setNeedsBank] = useState(false);

  const institutions = useQuery({
    queryKey: ['detected-transactions', 'institutions'],
    queryFn: fetchInstitutions,
    enabled: needsBank,
    staleTime: 60 * 60 * 1000,
  });

  const ingest = useMutation({
    mutationFn: ingestMessage,
    onSuccess: (result) => {
      if (result.status === 'ignored' && result.reason === 'unknown_sender') {
        setNeedsBank(true);
        return;
      }
      if (result.status === 'created' || result.status === 'needs_review' || result.status === 'already_synced') {
        setText('');
        setSubject('');
        setNeedsBank(false);
        void queryClient.invalidateQueries({ queryKey: ['detected-transactions'] });
        invalidateMoneyQueries(queryClient);
      }
    },
  });

  const result = ingest.data;
  const showOutcome = !!result && !(result.status === 'ignored' && result.reason === 'unknown_sender');
  return {
    kind,
    setKind,
    text,
    setText,
    sender,
    setSender,
    subject,
    setSubject,
    needsBank,
    institutionId,
    setInstitutionId,
    institutionItems: (institutions.data ?? []).map((i) => ({ id: i.id, label: i.name })),
    submit: () => {
      if (!text.trim()) return;
      ingest.mutate({
        kind,
        text,
        sender: sender.trim() || null,
        subject: kind === 'email' ? subject.trim() || null : null,
        institutionId: institutionId || null,
      });
    },
    isSubmitting: ingest.isPending,
    outcome: showOutcome ? ingestOutcome(result) : null,
    error: ingest.error ? getApiErrorMessage(ingest.error, 'Could not read this message') : null,
  };
}
