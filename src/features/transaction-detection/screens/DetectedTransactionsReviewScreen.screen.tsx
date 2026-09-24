import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/theme';
import { StackNavHeader } from '@/shared/components/ui';
import { useDetectedTransactionsReview } from '../hooks/useDetectedTransactionsReview.hook';
import { DetectedTransactionList } from '../components/review/DetectedTransactionList.component';
import { createStyles } from './DetectedTransactionsReviewScreen.styles';

export function DetectedTransactionsReviewScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    items,
    isLoading,
    isRefreshing,
    error,
    refresh,
    confirmTransaction,
    rejectTransaction,
    busyId,
  } = useDetectedTransactionsReview();

  const handleConfirm = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    confirmTransaction(item);
  };

  const handleDismiss = (id: string) => {
    rejectTransaction(id);
  };

  const renderHeader = () => {
    if (items.length === 0) return null;
    return (
      <View style={styles.headerSummary}>
        <Text style={styles.summaryText}>
          <Text style={styles.countHighlight}>{items.length}</Text> auto-detected transactions to review
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StackNavHeader title="Review Detected Transactions" />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <DetectedTransactionList
          data={items}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
          busyId={busyId}
          onRefresh={refresh}
          refreshing={isRefreshing}
          ListHeaderComponent={renderHeader()}
        />
      )}
    </View>
  );
}
