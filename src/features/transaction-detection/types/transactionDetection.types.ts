import type {
  ConfidenceTier,
  Direction,
  MessageSource,
  NormalizedMessage,
  PackKillSwitch,
  SyncItemPayload,
  SyncItemResult,
  TransactionType,
} from '@budgetbrain/detection-core';

// Shared pipeline types come from @budgetbrain/detection-core so mobile, backend and web agree.
export type {
  ConfidenceTier,
  Direction as DetectedTransactionDirection,
  MessageSource as DetectedTransactionSource,
  SyncItemPayload,
  SyncItemResult,
  TransactionType as DetectedTransactionType,
};

/** A message as the access layer delivers it (spec §4). */
export type RawIncomingMessage = NormalizedMessage;

export type DetectedTransactionStatus =
  | 'auto_approved'
  | 'pending_review'
  | 'user_confirmed'
  | 'rejected'
  | 'duplicate';

/**
 * A detected transaction as the server returns it. `amount` is a decimal string; parse it with
 * core `parseMoney` and never with `Number(...).toFixed` (gap P0-7).
 */
export interface DetectedTransactionDto {
  id: string;
  amount: string;
  currency: string;
  direction: Direction;
  transactionType: TransactionType;
  subtype: string | null;
  paymentMethod: string | null;
  merchant: string | null;
  categoryId: string | null;
  categoryName: string | null;
  financialAccountId: string | null;
  financialAccountName: string | null;
  accountTail: string | null;
  referenceNumber: string | null;
  institutionId: string | null;
  transactionDate: string;
  confidenceTier: ConfidenceTier | null;
  reviewReason: string | null;
  status: DetectedTransactionStatus;
  source: MessageSource;
  createdTransactionId: string | null;
  createdAt: string;
}

export interface LearnedMerchantRule {
  merchant: string;
  categoryId: string;
  categoryName?: string;
  updatedAt: string;
}

export interface SyncStateData {
  latestSyncedTransactionDate: string | null;
  totalDetectedCount: number;
  pendingReviewCount: number;
}

/** Server kill switches plus the user's own preference (plan task T1.16). */
export interface DetectionConfig {
  enabled: boolean;
  autoCreateEnabled: boolean;
  minAppVersion: string | null;
  autoAddHighConfidence: boolean;
  /** Per institution, template, country, pack and app version (plan T4.6); core applies them. */
  killSwitches?: PackKillSwitch[];
}

/** `GET /detected-transactions/knowledge-pack` (plan T4.3). */
export interface KnowledgePackInfo {
  country: string;
  version: number;
  etag: string;
  url: string;
  bytes: number;
  delta: { baseVersion: number; url: string; bytes: number } | null;
}

/** Totals from one flush of the sync queue. */
export interface SyncFlushSummary {
  sent: number;
  created: number;
  needsReview: number;
  alreadySynced: number;
  rejected: number;
  /** Items still queued because the network or server failed; retried later. */
  remaining: number;
}

export interface HistoricalSyncProgress {
  isScanning: boolean;
  totalMessages: number;
  processedCount: number;
  /** Items the pipeline queued for sync (not yet confirmed by the server). */
  queuedCount: number;
  summary?: SyncFlushSummary;
  error?: string;
}

/**
 * What the pipeline needs to know about the user, persisted in the detection store so the
 * headless drain can run without Redux (plan T2.5). Written by the foreground app.
 */
export interface DetectionContext {
  userId: string | null;
  isAutoTrackingEnabled: boolean;
  selectedSimSlot: 'all' | '1' | '2';
  excludedMerchants: string[];
  excludedAccountTails: string[];
  learnedRules: Record<string, LearnedMerchantRule>;
  notificationPreference: 'all' | 'needs_review' | 'off';
}

export type DetectionCategory = { id: string; name: string };

/**
 * How detection reaches the server. The foreground app uses the axios client; the headless
 * drain uses plain fetch so it doesn't load the Redux store.
 */
export interface DetectionTransport {
  isOnline(): Promise<boolean>;
  syncBatch(items: SyncItemPayload[], idempotencyKey: string): Promise<{ results: SyncItemResult[] }>;
  fetchConfig(): Promise<DetectionConfig>;
}
