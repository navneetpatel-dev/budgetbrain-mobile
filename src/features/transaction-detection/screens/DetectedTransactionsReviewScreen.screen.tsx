import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/theme';
import { StackNavHeader } from '@/shared/components/ui';
import { useDetectedTransactionsReview } from '../hooks/useDetectedTransactionsReview.hook';
import { DetectedTransactionList } from '../components/review/DetectedTransactionList.component';
import type { ProcessedTransaction } from '../types/transactionDetection.types';
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
  } = useDetectedTransactionsReview();

  const handleConfirm = (id: string, categoryId?: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    confirmTransaction(item, { categoryId });
  };

  const handleDismiss = (id: string) => {
    rejectTransaction(id);
  };

  const handlePressItem = (transaction: ProcessedTransaction) => {
    // When pressed, user could edit category or details
    handleConfirm(transaction.id, transaction.categoryId || undefined);
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
          onPress={handlePressItem}
          onRefresh={refresh}
          refreshing={isRefreshing}
          ListHeaderComponent={renderHeader()}
        />
      )}
    </View>
  );
}
