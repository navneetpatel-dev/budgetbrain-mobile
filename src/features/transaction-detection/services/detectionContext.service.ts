import type { DetectionCategory, DetectionContext } from '../types/transactionDetection.types';
import { getKv, setKv } from './store/detectionStore.service';

const CONTEXT_KEY = 'context';
const CATEGORIES_KEY = 'categories';

let lastSaved: string | null = null;

/** Builds the context from the app's Redux state. Only the fields the pipeline reads. */
export function contextFromState(state: {
  auth: { user: { id: string } | null };
  transactionDetection: Omit<DetectionContext, 'userId' | 'ownAccountTails' | 'ownVpas'> & {
    ownAccountTails?: string[];
    linkedAccountTails?: string[];
    ownVpas?: string[];
  };
}): DetectionContext {
  const detection = state.transactionDetection;
  const tails = [...new Set([...(detection.ownAccountTails ?? []), ...(detection.linkedAccountTails ?? [])])];
  return {
    userId: state.auth.user?.id ?? null,
    isAutoTrackingEnabled: detection.isAutoTrackingEnabled,
    selectedSimSlot: detection.selectedSimSlot,
    excludedMerchants: detection.excludedMerchants,
    excludedAccountTails: detection.excludedAccountTails,
    learnedRules: detection.learnedRules,
    notificationPreference: detection.notificationPreference,
    ownAccountTails: tails,
    ownVpas: detection.ownVpas ?? [],
  };
}

/** Persists the context for the headless drain; skips the write when nothing changed. */
export async function saveDetectionContext(context: DetectionContext): Promise<void> {
  const serialized = JSON.stringify(context);
  if (serialized === lastSaved) return;
  await setKv(CONTEXT_KEY, context);
  lastSaved = serialized;
}

export function loadDetectionContext(): Promise<DetectionContext | null> {
  return getKv<DetectionContext>(CONTEXT_KEY);
}

/** The user's categories, saved by the foreground app so headless runs can match them too. */
export function saveDetectionCategories(categories: DetectionCategory[]): Promise<void> {
  return setKv(CATEGORIES_KEY, categories.map(({ id, name }) => ({ id, name })));
}

export async function loadDetectionCategories(): Promise<DetectionCategory[]> {
  return (await getKv<DetectionCategory[]>(CATEGORIES_KEY)) ?? [];
}

/** Test helper. */
export function __resetDetectionContextForTests() {
  lastSaved = null;
}
