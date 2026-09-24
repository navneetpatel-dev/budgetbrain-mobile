import { store } from '@/shared/store';
import { replaceLearnedRules, resetLearnedRules, setLinkedAccountTails } from '@/shared/store/transactionDetectionSlice';
import { apiGet } from '@/shared/services/api';
import type { FinancialAccount } from '@/shared/types';
import { deleteLearnedMerchantRules, fetchLearnedMerchantRules } from '../api/detectedTransactions.api';
import { normalizeAccountTail } from '../utils/ownAccounts';
import { getKv, setKv } from './store/detectionStore.service';

/**
 * Keeps the user's detection profile on the device current (plan T5.3, T5.7):
 * - learned merchant rules come from the server (the only place they are written), fetched on
 *   login and daily with an ETag, so a reinstall restores them;
 * - the last digits of the user's financial accounts feed transfer detection.
 */
const RULES_ETAG_KEY = 'rules_etag';
const RULES_SYNCED_KEY = 'rules_synced_at';
const DAY_MS = 24 * 60 * 60 * 1000;

export async function syncMerchantRules(options: { force?: boolean; now?: number } = {}): Promise<'updated' | 'unchanged' | 'skipped'> {
  const now = options.now ?? Date.now();
  if (!options.force) {
    const last = (await getKv<number>(RULES_SYNCED_KEY)) ?? 0;
    if (now - last < DAY_MS) return 'skipped';
  }
  // Without stored rules the ETag would suppress the very list we need (fresh install, reset).
  const haveRules = Object.keys(store.getState().transactionDetection.learnedRules).length > 0;
  const etag = haveRules ? ((await getKv<string>(RULES_ETAG_KEY)) ?? undefined) : undefined;
  const result = await fetchLearnedMerchantRules(etag);
  await setKv(RULES_SYNCED_KEY, now);
  if (!result) return 'unchanged';
  store.dispatch(replaceLearnedRules(result.rules));
  if (result.etag) await setKv(RULES_ETAG_KEY, result.etag);
  return 'updated';
}

/** Clears the rules on the server first, then here, so the next sync can't bring them back. */
export async function resetMerchantRules(): Promise<void> {
  await deleteLearnedMerchantRules();
  store.dispatch(resetLearnedRules());
  await setKv(RULES_ETAG_KEY, null);
}

export async function syncLinkedAccountTails(): Promise<void> {
  const res = await apiGet<{ accounts: FinancialAccount[] }>('/accounts', { limit: 100 });
  const tails = (res.accounts ?? [])
    .map((account) => normalizeAccountTail(account.accountNumberLast4 ?? ''))
    .filter((tail): tail is string => tail !== null);
  store.dispatch(setLinkedAccountTails(tails));
}
