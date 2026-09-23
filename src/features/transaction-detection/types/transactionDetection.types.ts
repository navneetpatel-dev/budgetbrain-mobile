export type DetectedTransactionDirection = 'DEBIT' | 'CREDIT';
export type DetectedTransactionType = 'expense' | 'income' | 'refund' | 'transfer';
export type DetectedTransactionSource = 'android_sms' | 'notification' | 'email' | 'csv' | 'bank_api';
export type DetectedTransactionStatus =
  | 'auto_approved'
  | 'pending_review'
  | 'user_confirmed'
  | 'rejected'
  | 'duplicate';

export interface RawIncomingMessage {
  id?: string;
  sender: string;
  content: string;
  receivedAt: string; // ISO string
  source: DetectedTransactionSource;
  simSlot?: number;
}

export interface ExtractedInfo {
  amount: number | null;
  currency: string;
  direction: DetectedTransactionDirection | null;
  transactionType: DetectedTransactionType;
  rawMerchant: string | null;
  normalizedMerchant: string | null;
  accountTail: string | null;
  referenceNumber: string | null;
  institutionName: string | null;
  transactionDate: string; // YYYY-MM-DD
  confidence: number;
}

export interface ProcessedTransaction {
  id: string; // local temp UUID or server UUID
  amount: number;
  currency: string;
  direction: DetectedTransactionDirection;
  transactionType: DetectedTransactionType;
  merchant: string | null;
  normalizedMerchant: string | null;
  categoryId: string | null;
  categoryName?: string | null;
  financialAccountId: string | null;
  accountTail: string | null;
  referenceNumber: string | null;
  institutionName: string | null;
  transactionDate: string;
  confidence: number;
  dedupFingerprint: string;
  source: DetectedTransactionSource;
  status: DetectedTransactionStatus;
  isSynced: boolean;
  createdTransactionId?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  createdAt: string;
}

export type DetectedTransaction = ProcessedTransaction;

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

export interface HistoricalSyncProgress {
  isScanning: boolean;
  totalMessages: number;
  processedCount: number;
  foundTransactions: ProcessedTransaction[];
  error?: string;
}
