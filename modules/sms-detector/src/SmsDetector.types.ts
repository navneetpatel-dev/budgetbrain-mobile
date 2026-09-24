/** One SMS the native pre-filter kept (plan T2.2, T2.7). */
export interface NativeSmsCandidate {
  /** Row id in the native candidate queue; pass it to `ackMessages` once the message is stored. */
  queueId: string;
  /** The provider `_id` for inbox messages; null for a live SMS not yet written to the inbox. */
  messageId: string | null;
  sender: string;
  body: string;
  /** Epoch milliseconds. */
  receivedAt: number;
  /** 1-based SIM slot, or null when the device doesn't report one. */
  simSlot: number | null;
}

export interface ScanInboxOptions {
  /** Only messages newer than this (epoch ms). */
  sinceMs: number;
  limit: number;
  /** 1-based slot to keep, or null for all SIMs. */
  simSlot?: number | null;
}

export interface SenderFilter {
  /** Exact uppercase headers, e.g. `HDFCBK`. */
  headers: string[];
  /** Uppercase substrings of a header, e.g. `HDFC`. */
  keywords: string[];
}

export type SmsDetectorEvents = {
  /** A live SMS passed the pre-filter while the app is in the foreground. */
  onCandidateQueued: () => void;
};
