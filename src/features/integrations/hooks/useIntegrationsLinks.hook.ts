import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { appHref } from '@/shared/utils/navigation';

/** Where detected transactions are reviewed and undone (the auto-tracking screens). */
export function useIntegrationsLinks() {
  const router = useRouter();
  const pendingReviewCount = useSelector((state: RootState) => state.transactionDetection.pendingReviewCount);
  return {
    pendingReviewCount,
    openReview: () => router.push(appHref('/transactions/review')),
    openHistory: () => router.push(appHref('/transactions/detected')),
  };
}
