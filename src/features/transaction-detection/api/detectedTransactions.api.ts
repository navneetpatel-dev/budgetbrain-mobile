import { api, apiDelete, apiGet, apiPatch, apiPost } from '@/shared/services/api';
import type { ApiResponse, Category } from '@/shared/types';
import type {
  DetectedTransactionDto,
  DetectionConfig,
  DiagnosticsUploadRow,
  LearnedMerchantRule,
  SkeletonUploadItem,
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

export async function updateDetectionSettings(
  settings: { autoAddHighConfidence: boolean } | { templateLearning: boolean }
): Promise<DetectionConfig> {
  return await apiPatch<DetectionConfig>('/detected-transactions/settings', settings);
}

/** Daily stage and reason counts (plan T7.1). The server replaces the days it receives. */
export async function uploadDetectionDiagnostics(rows: DiagnosticsUploadRow[]): Promise<{ days: number; rows: number }> {
  return await apiPost<{ days: number; rows: number }>('/detected-transactions/diagnostics', { rows });
}

/** Masked message shapes, only with template learning on (plan T7.4). At most 50 per call. */
export async function uploadMessageSkeletons(items: SkeletonUploadItem[]): Promise<{ accepted: number }> {
  return await apiPost<{ accepted: number }>('/detected-transactions/skeletons', { items });
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

/**
 * Learned rules with their ETag (plan T5.3); `null` when the server answers 304 Not Modified.
 * Rules are only ever written by the server, when the user corrects a detection (T5.2).
 */
export async function fetchLearnedMerchantRules(etag?: string): Promise<{ rules: LearnedMerchantRule[]; etag: string | null } | null> {
  const response = await api.get<ApiResponse<LearnedMerchantRule[]>>('/detected-transactions/rules', {
    headers: etag ? { 'If-None-Match': etag } : {},
    validateStatus: (status) => status === 200 || status === 304,
  });
  if (response.status === 304) return null;
  return { rules: response.data.data, etag: (response.headers.etag as string | undefined) ?? null };
}

/** "Reset learned preferences" (plan T5.7): the server holds the rules, so they are cleared there. */
export async function deleteLearnedMerchantRules(): Promise<{ deleted: number }> {
  return await apiDelete<{ deleted: number }>('/detected-transactions/rules');
}

/** Detected items by status, for the "Detected" history (plan T5.5). */
export async function fetchDetected(
  status: DetectedTransactionDto['status'] | undefined,
  page = 1,
  limit = 50
): Promise<DetectedListResponse> {
  return await apiGet<DetectedListResponse>('/detected-transactions', { ...(status ? { status } : {}), page, limit });
}

/** "Delete my detected data" (plan T5.7). */
export async function deleteMyDetectedData(): Promise<{ deleted: number }> {
  return await apiDelete<{ deleted: number }>('/detected-transactions/me');
}

/** Categories used to map detected merchants to the user's own categories. */
export async function fetchCategoriesForDetection(): Promise<Pick<Category, 'id' | 'name'>[]> {
  const res = await apiGet<{ categories: Category[] }>('/categories', { limit: 100 });
  return (res.categories ?? []).map(({ id, name }) => ({ id, name }));
}
