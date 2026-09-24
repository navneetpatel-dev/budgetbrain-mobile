/** One SMS or bank-app notification the native pre-filter kept (plan T2.2, T2.7, T8.1). */
export interface NativeSmsCandidate {
  /** Row id in the native candidate queue; pass it to `ackMessages` once the message is stored. */
  queueId: string;
  /** The provider `_id` for inbox messages; null for a live SMS not yet written to the inbox. */
  messageId: string | null;
  /** SMS sender header, or the app's package name for a notification. */
  sender: string;
  body: string;
  /** Epoch milliseconds. */
  receivedAt: number;
  /** 1-based SIM slot, or null when the device doesn't report one. */
  simSlot: number | null;
  /** Missing from builds before T8.1, which only queued SMS. */
  source?: 'android_sms' | 'notification';
}

export interface NotificationFilter {
  /** Android package names of bank and UPI apps, from the knowledge pack. */
  packages: string[];
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
  /**
   * Multi-word institution names (`HDFC BANK`). With a money token, an unknown business header
   * whose body names one is kept too; core then caps it below the high tier (plan T3.2).
   */
  bodyNames?: string[];
  /** 4-letter IFSC prefixes (`HDFC`); an IFSC code in the body counts like a name. */
  ifscPrefixes?: string[];
}

export type SmsDetectorEvents = {
  /** A live SMS passed the pre-filter while the app is in the foreground. */
  onCandidateQueued: () => void;
};
