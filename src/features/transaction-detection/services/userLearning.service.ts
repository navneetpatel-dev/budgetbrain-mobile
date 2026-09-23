import { store } from '@/shared/store';
import { setLearnedRule } from '@/shared/store/transactionDetectionSlice';
import { saveLearnedMerchantRule } from '../api/detectedTransactions.api';

export async function learnMerchantCategoryPreference(
  merchant: string,
  categoryId: string,
  categoryName?: string
): Promise<void> {
  const cleanMerchant = merchant.trim();
  if (!cleanMerchant || !categoryId) return;

  // 1. Immediately update local Redux store
  store.dispatch(
    setLearnedRule({
      merchant: cleanMerchant,
      categoryId,
      categoryName,
      updatedAt: new Date().toISOString(),
    })
  );

  // 2. Persist to backend database for cross-device sync
  try {
    await saveLearnedMerchantRule(cleanMerchant, categoryId);
  } catch {
    // Local rule remains effective even if offline
  }
}
