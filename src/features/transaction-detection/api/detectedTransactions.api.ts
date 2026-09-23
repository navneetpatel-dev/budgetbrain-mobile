import { apiGet, apiPost } from '@/shared/services/api';
import type {
  LearnedMerchantRule,
  ProcessedTransaction,
  SyncStateData,
} from '../types/transactionDetection.types';

export interface SyncBatchPayload {
  items: Array<{
    amount: number;
    currency: string;
    direction: string;
    transactionType: string;
    merchant?: string | null;
    normalizedMerchant?: string | null;
    categoryId?: string | null;
    financialAccountId?: string | null;
    accountTail?: string | null;
    referenceNumber?: string | null;
    institutionName?: string | null;
    transactionDate: string;
    confidence: number;
    dedupFingerprint: string;
    source: string;
    status?: string;
    metadata?: Record<string, unknown> | null;
  }>;
}

export interface SyncBatchResult {
  totalProcessed: number;
  createdCount: number;
  alreadySyncedCount: number;
  failedCount: number;
  results: Array<{
    fingerprint: string;
    status: 'created' | 'already_synced' | 'validation_error';
    detectedId?: string;
    transactionId?: string | null;
    error?: string;
  }>;
}

export interface PendingListResponse {
  items: ProcessedTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConfirmPayload {
  categoryId?: string | null;
  financialAccountId?: string | null;
  merchant?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  learnMerchantCategory?: boolean;
}

export async function fetchSyncState(): Promise<SyncStateData> {
  return await apiGet<SyncStateData>('/detected-transactions/sync-state');
}

export async function syncDetectedBatch(payload: SyncBatchPayload): Promise<SyncBatchResult> {
  return await apiPost<SyncBatchResult>('/detected-transactions/sync', payload);
}

export async function fetchPendingDetected(page = 1, limit = 20): Promise<PendingListResponse> {
  return await apiGet<PendingListResponse>('/detected-transactions/pending', { page, limit });
}

export async function confirmDetectedTransaction(
  id: string,
  payload: ConfirmPayload
): Promise<ProcessedTransaction> {
  return await apiPost<ProcessedTransaction>(`/detected-transactions/pending/${id}/confirm`, payload);
}

export async function rejectDetectedTransaction(id: string): Promise<ProcessedTransaction> {
  return await apiPost<ProcessedTransaction>(`/detected-transactions/pending/${id}/reject`, {});
}

export async function fetchLearnedMerchantRules(): Promise<LearnedMerchantRule[]> {
  return await apiGet<LearnedMerchantRule[]>('/detected-transactions/rules');
}

export async function saveLearnedMerchantRule(
  merchant: string,
  categoryId: string
): Promise<LearnedMerchantRule> {
  return await apiPost<LearnedMerchantRule>('/detected-transactions/rules', {
    merchant,
    categoryId,
  });
}
