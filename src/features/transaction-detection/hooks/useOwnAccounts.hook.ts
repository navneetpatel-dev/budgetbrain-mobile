import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import {
  MAX_OWN_ENTRIES,
  addOwnAccountTail,
  addOwnVpa,
  removeOwnAccountTail,
  removeOwnVpa,
} from '@/shared/store/transactionDetectionSlice';
import { normalizeAccountTail, normalizeVpa } from '../utils/ownAccounts';

/**
 * "My accounts" in settings (plan T5.7): account tails and UPI IDs the user adds by hand, next to
 * the tails of their linked accounts. Money moving between two of these is a transfer.
 */
export function useOwnAccounts() {
  const dispatch = useDispatch();
  const { ownAccountTails, ownVpas, linkedAccountTails } = useSelector((state: RootState) => state.transactionDetection);
  const [tailDraft, setTailDraft] = useState('');
  const [vpaDraft, setVpaDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitTail = () => {
    const tail = normalizeAccountTail(tailDraft);
    if (!tail) return setError('Enter the last 3 or 4 digits of the account or card number.');
    if (ownAccountTails.length >= MAX_OWN_ENTRIES) return setError(`You can add up to ${MAX_OWN_ENTRIES} account numbers.`);
    dispatch(addOwnAccountTail(tail));
    setTailDraft('');
    setError(null);
  };

  const submitVpa = () => {
    const vpa = normalizeVpa(vpaDraft);
    if (!vpa) return setError('Enter a UPI ID such as name@okhdfc.');
    if (ownVpas.length >= MAX_OWN_ENTRIES) return setError(`You can add up to ${MAX_OWN_ENTRIES} UPI IDs.`);
    dispatch(addOwnVpa(vpa));
    setVpaDraft('');
    setError(null);
  };

  return {
    ownAccountTails,
    ownVpas,
    // Linked accounts already count; only show the ones the user didn't also add by hand.
    linkedAccountTails: linkedAccountTails.filter((t) => !ownAccountTails.includes(t)),
    tailDraft,
    vpaDraft,
    error,
    setTailDraft,
    setVpaDraft,
    submitTail,
    submitVpa,
    removeTail: (tail: string) => dispatch(removeOwnAccountTail(tail)),
    removeVpa: (vpa: string) => dispatch(removeOwnVpa(vpa)),
  };
}
