import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { appHref } from '@/shared/utils/navigation';

/** The "N to review" chip on the transaction list (plan T5.6). */
export function useReviewChip() {
  const router = useRouter();
  const count = useSelector((state: RootState) => state.transactionDetection.pendingReviewCount);
  return { count, open: () => router.push(appHref('/transactions/review')) };
}
