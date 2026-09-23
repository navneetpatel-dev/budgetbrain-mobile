import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import type { DetectedTransaction } from '../../types/transactionDetection.types';
import { AutoDetectedBadge } from '../badge/AutoDetectedBadge.component';
import { createStyles } from './DetectedTransactionRow.styles';

export interface DetectedTransactionRowProps {
  transaction: DetectedTransaction;
  onConfirm: (id: string, categoryId?: string) => void;
  onDismiss: (id: string) => void;
  onPress?: (transaction: DetectedTransaction) => void;
}

export function DetectedTransactionRow({
  transaction,
  onConfirm,
  onDismiss,
  onPress,
}: DetectedTransactionRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isCredit = transaction.direction === 'CREDIT';
  const prefix = isCredit ? '+' : '-';
  const formattedAmount = `${prefix}${transaction.currency} ${transaction.amount.toFixed(2)}`;

  const merchantDisplayName =
    transaction.normalizedMerchant ||
    transaction.merchant ||
    (transaction.accountTail
      ? `${transaction.institutionName || 'Bank'} (••• ${transaction.accountTail})`
      : transaction.institutionName || 'Unknown Bank');

  const accountInfo = [
    transaction.institutionName,
    transaction.accountTail ? `••• ${transaction.accountTail}` : null,
    new Date(transaction.transactionDate || transaction.createdAt).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
  ]
    .filter(Boolean)
    .join(' · ');

  const confidenceScore = transaction.confidence ?? 0.8;
  const confidencePercent = Math.round(confidenceScore * 100);

  let confidencePillStyle = styles.confidenceHigh;
  let confidenceTextStyle = styles.confidenceHighText;
  if (confidenceScore < 0.70) {
    confidencePillStyle = styles.confidenceLow;
    confidenceTextStyle = styles.confidenceLowText;
  } else if (confidenceScore < 0.85) {
    confidencePillStyle = styles.confidenceMedium;
    confidenceTextStyle = styles.confidenceMediumText;
  }

  const handleRowPress = () => {
    if (onPress) {
      onPress(transaction);
    }
  };

  const handleConfirm = () => {
    onConfirm(transaction.id, transaction.categoryId || undefined);
  };

  const handleDismiss = () => {
    onDismiss(transaction.id);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleRowPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {merchantDisplayName}
          </Text>
          <Text style={styles.accountInfo} numberOfLines={1}>
            {accountInfo}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amountText,
              isCredit ? styles.creditAmount : styles.debitAmount,
            ]}
          >
            {formattedAmount}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.tagGroup}>
          <AutoDetectedBadge source={transaction.source} />
          {transaction.categoryName && (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {transaction.categoryName}
              </Text>
            </View>
          )}
          <View style={[styles.confidencePill, confidencePillStyle]}>
            <Text style={confidenceTextStyle}>
              {confidencePercent}% match
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Dismiss detected transaction"
        >
          <Text style={styles.dismissText}>Ignore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Confirm detected transaction"
        >
          <Text style={styles.confirmText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
