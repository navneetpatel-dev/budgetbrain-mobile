import type { ConfirmPayload } from '../api/detectedTransactions.api';
import type { CorrectedField, DetectedTransactionDto } from '../types/transactionDetection.types';

export type EditableType = DetectedTransactionDto['transactionType'];

export interface DetectedEditValues {
  merchant: string;
  transactionType: EditableType;
  categoryId: string;
  financialAccountId: string;
  notes: string;
}

export const NO_SELECTION = '';

export function initialEditValues(item: DetectedTransactionDto | null): DetectedEditValues {
  return {
    merchant: item?.merchant ?? '',
    transactionType: item?.transactionType ?? 'expense',
    categoryId: item?.categoryId ?? NO_SELECTION,
    financialAccountId: item?.financialAccountId ?? NO_SELECTION,
    notes: '',
  };
}

/**
 * Only the fields the user actually changed (plan T5.2): the server learns merchant → category
 * from a changed category or merchant, so an untouched field must not be sent as a "correction".
 */
export function buildConfirmOverrides(item: DetectedTransactionDto, values: DetectedEditValues): ConfirmPayload {
  const overrides: ConfirmPayload = {};
  const merchant = values.merchant.trim();
  if (merchant && merchant !== (item.merchant ?? '')) overrides.merchant = merchant;
  if (values.transactionType !== item.transactionType) overrides.transactionType = values.transactionType;
  const categoryId = values.categoryId || null;
  if (values.transactionType !== 'transfer' && categoryId !== (item.categoryId ?? null)) overrides.categoryId = categoryId;
  const accountId = values.financialAccountId || null;
  if (accountId !== (item.financialAccountId ?? null)) overrides.financialAccountId = accountId;
  if (values.notes.trim()) overrides.notes = values.notes.trim();
  return overrides;
}

/**
 * The parsing field a correction fixed, for template learning (plan T7.4): the merchant first,
 * then the type, then the account. A category or note change isn't a parsing error.
 */
export function correctedFieldOf(overrides: ConfirmPayload): CorrectedField | null {
  if (overrides.merchant !== undefined) return 'merchant';
  if (overrides.transactionType !== undefined) return 'type';
  if (overrides.financialAccountId !== undefined) return 'account';
  return null;
}
