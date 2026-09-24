import { apiDelete, apiGet, apiPatch, apiPost } from '@/shared/services/api';
import type { Category } from '@/shared/types';
import type {
  DetectedTransactionDto,
  DetectionConfig,
  LearnedMerchantRule,
  SyncItemPayload,
  SyncItemResult,
  SyncStateData,
} from '../types/transactionDetection.types';

export interface SyncBatchResult {
  totalProcessed: number;
  createdCount: number;
  needsReviewCount: number;
  alreadySyncedCount: number;
  failedCount: number;
  results: SyncItemResult[];
}

export interface DetectedListResponse {
  items: DetectedTransactionDto[];
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
  transactionType?: DetectedTransactionDto['transactionType'];
  learnMerchantCategory?: boolean;
}

export async function fetchDetectionConfig(): Promise<DetectionConfig> {
  return await apiGet<DetectionConfig>('/detected-transactions/config');
}

export async function updateDetectionSettings(settings: { autoAddHighConfidence: boolean }): Promise<DetectionConfig> {
  return await apiPatch<DetectionConfig>('/detected-transactions/settings', settings);
}

export async function fetchSyncState(): Promise<SyncStateData> {
  return await apiGet<SyncStateData>('/detected-transactions/sync-state');
}

/** At most 100 items per call; the Idempotency-Key makes a retried request safe to replay. */
export async function syncDetectedBatch(items: SyncItemPayload[], idempotencyKey: string): Promise<SyncBatchResult> {
  return await apiPost<SyncBatchResult>(
    '/detected-transactions/sync',
    { items },
    { headers: { 'Idempotency-Key': idempotencyKey } }
  );
}

export async function fetchPendingDetected(page = 1, limit = 20): Promise<DetectedListResponse> {
  return await apiGet<DetectedListResponse>('/detected-transactions/pending', { page, limit });
}

export async function confirmDetectedTransaction(id: string, payload: ConfirmPayload): Promise<DetectedTransactionDto> {
  return await apiPost<DetectedTransactionDto>(`/detected-transactions/pending/${id}/confirm`, payload);
}

export async function rejectDetectedTransaction(id: string): Promise<DetectedTransactionDto> {
  return await apiPost<DetectedTransactionDto>(`/detected-transactions/pending/${id}/reject`, {});
}

export async function undoDetectedTransaction(id: string): Promise<DetectedTransactionDto> {
  return await apiPost<DetectedTransactionDto>(`/detected-transactions/${id}/undo`, {});
}

export async function deleteDetectedTransaction(id: string): Promise<DetectedTransactionDto> {
  return await apiDelete<DetectedTransactionDto>(`/detected-transactions/${id}`);
}

export async function fetchLearnedMerchantRules(): Promise<LearnedMerchantRule[]> {
  return await apiGet<LearnedMerchantRule[]>('/detected-transactions/rules');
}

export async function saveLearnedMerchantRule(merchant: string, categoryId: string): Promise<LearnedMerchantRule> {
  return await apiPost<LearnedMerchantRule>('/detected-transactions/rules', { merchant, categoryId });
}

/** Categories used to map detected merchants to the user's own categories. */
export async function fetchCategoriesForDetection(): Promise<Pick<Category, 'id' | 'name'>[]> {
  const res = await apiGet<{ categories: Category[] }>('/categories', { limit: 100 });
  return (res.categories ?? []).map(({ id, name }) => ({ id, name }));
}
