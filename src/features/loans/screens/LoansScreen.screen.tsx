import { useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { EmptyState, ListRowsSkeleton, StickyHeaderFlatScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader.component';
import { LoanCard } from '@/features/loans/components/LoanCard.component';
import { useDeleteLoan } from '@/features/loans/hooks/useDeleteLoan.hook';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import { showAlert } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import type { Loan } from '@/shared/types';

function keyExtractor(item: Loan) {
  return item.id;
}

export function LoansScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { deleteLoan } = useDeleteLoan();
  const { data: loans, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Loan, 'loans'>({
    queryKey: ['loans'],
    url: '/loans',
    itemsKey: 'loans',
  });

  const handleDeleteLoan = useCallback(
    (id: string) => {
      deleteLoan(id).catch(() => showAlert('Error', 'Could not delete loan'));
    },
    [deleteLoan]
  );

  const renderItem = useCallback(
    ({ item }: { item: Loan }) => <LoanCard loan={item} onDelete={handleDeleteLoan} />,
    [handleDeleteLoan]
  );

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
      keyExtractor={keyExtractor}
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
      renderItem={renderItem}
    />
  );
}
