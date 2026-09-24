import type { RecentTransaction } from '@budgetbrain/detection-core';
import type { Transaction } from '@/shared/types';
import { toRecentTransactions } from '../utils/recentDigest';
import { getKv, setKv } from './store/detectionStore.service';

/**
 * The recent-transaction digest (plan T3.7, T3.12), kept in the detection store so the headless
 * drain has it too. Refreshed from the server by the foreground app; a stale or another user's
 * digest is never used.
 */
export const RECENT_DIGEST_KEY = 'recent_digest';
const DAY_MS = 24 * 60 * 60 * 1000;
/** How far back the digest reaches: core pairs within a few days, refunds within about a week. */
const WINDOW_DAYS = 10;
const PAGE_SIZE = 100;
const MAX_PAGES = 2;
const REFRESH_AFTER_MS = 15 * 60 * 1000;
const STALE_AFTER_MS = 14 * DAY_MS;

interface StoredDigest {
  userId: string;
  savedAt: number;
  items: RecentTransaction[];
}

export type FetchTransactionsPage = (startDate: string, page: number, limit: number) => Promise<Transaction[]>;

export async function loadRecentDigest(userId: string, now = Date.now()): Promise<RecentTransaction[]> {
  const stored = await getKv<StoredDigest>(RECENT_DIGEST_KEY).catch(() => null);
  if (!stored || stored.userId !== userId || now - stored.savedAt > STALE_AFTER_MS || !Array.isArray(stored.items)) return [];
  return stored.items;
}

/** Fetches the last days' transactions unless the saved digest is fresh. Returns whether it fetched. */
export async function refreshRecentDigest(
  fetchPage: FetchTransactionsPage,
  userId: string,
  options: { now?: number; force?: boolean } = {}
): Promise<boolean> {
  const now = options.now ?? Date.now();
  const stored = await getKv<StoredDigest>(RECENT_DIGEST_KEY).catch(() => null);
  if (!options.force && stored?.userId === userId && now - stored.savedAt < REFRESH_AFTER_MS) return false;
  const startDate = new Date(now - WINDOW_DAYS * DAY_MS).toISOString().slice(0, 10);
  const rows: Transaction[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const batch = await fetchPage(startDate, page, PAGE_SIZE);
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  const digest: StoredDigest = { userId, savedAt: now, items: toRecentTransactions(rows) };
  await setKv(RECENT_DIGEST_KEY, digest);
  return true;
}
