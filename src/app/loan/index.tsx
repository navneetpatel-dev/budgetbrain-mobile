import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { EmptyState, ListRowsSkeleton, StickyHeaderFlatScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { LoanCard } from '@/features/loans/components/LoanCard';
import { useDeleteLoan } from '@/features/loans/hooks/useDeleteLoan';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showAlert, showConfirmation } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import type { Loan } from '@/shared/types';

export default function LoansScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { deleteLoan } = useDeleteLoan();
  const { data: loans, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Loan, 'loans'>({
    queryKey: ['loans'],
    url: '/loans',
    itemsKey: 'loans',
  });

  return (
    <StickyHeaderFlatScreen
      inset="stack"
      header={
        <ProfileStackHeader
          screen="loans"
          subtitle={isLoading ? 'Loading…' : `${total} loan${total !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Add loan"
          onAction={() => router.push('/loan/add')}
        />
      }
      data={isLoading ? [] : loans}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={3} variant="goal" />
        ) : isError ? (
          <EmptyState
            title="Couldn't load loans"
            subtitle="Check your connection and try again"
            icon="wallet"
            action="Retry"
            onAction={() => void refetch()}
          />
        ) : (
          <EmptyState
            title="No loans or debts tracked"
            subtitle="Track a loan, credit card, or EMI to see your payoff progress"
            icon="wallet"
            action="Add loan"
            onAction={() => router.push('/loan/add')}
          />
        )
      }
      renderItem={({ item }) => (
        <LoanCard
          loan={item}
          onDelete={() =>
            showConfirmation(CONFIRM.deleteLoan, () =>
              deleteLoan(item.id).catch(() => showAlert('Error', 'Could not delete loan')),
            )
          }
        />
      )}
    />
  );
}
