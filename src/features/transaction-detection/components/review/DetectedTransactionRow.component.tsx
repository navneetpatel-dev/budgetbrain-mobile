import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { minorUnits, parseMoney } from '@budgetbrain/detection-core';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { DetectedTransactionDto } from '../../types/transactionDetection.types';
import { AutoDetectedBadge } from '../badge/AutoDetectedBadge.component';
import { createStyles } from './DetectedTransactionRow.styles';

export interface DetectedTransactionRowProps {
  transaction: DetectedTransactionDto;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  busy?: boolean;
}

const TIER_LABEL = { high: 'High confidence', medium: 'Needs a look', low: 'Low confidence' } as const;

const REASON_LABEL: Record<string, string> = {
  medium_confidence: 'Some details could not be confirmed',
  low_confidence: 'Details are unclear',
  kill_switch: 'Automatic adding is paused',
  auto_add_disabled: 'You review every detected transaction',
};

const TYPE_LABEL = { expense: 'Expense', income: 'Income', refund: 'Refund', transfer: 'Transfer' } as const;

export function DetectedTransactionRow({ transaction, onConfirm, onDismiss, busy = false }: DetectedTransactionRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // The server sends DECIMAL amounts as strings; parse with core, never Number().toFixed (gap P0-7).
  const amountMajor = parseMoney(transaction.amount, transaction.currency) / 10 ** minorUnits(transaction.currency);
  const sign = transaction.transactionType === 'transfer' ? '⇄ ' : transaction.direction === 'CREDIT' ? '+' : '−';
  const formattedAmount = `${sign}${formatCurrency(amountMajor, transaction.currency)}`;
  const isCredit = transaction.direction === 'CREDIT' && transaction.transactionType !== 'transfer';

  const merchantDisplayName =
    transaction.merchant ??
    (transaction.accountTail ? `Account ••• ${transaction.accountTail}` : TYPE_LABEL[transaction.transactionType]);

  const accountInfo = [
    TYPE_LABEL[transaction.transactionType],
    transaction.accountTail ? `••• ${transaction.accountTail}` : null,
    new Date(`${transaction.transactionDate}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' }),
  ]
    .filter(Boolean)
    .join(' · ');

  const tier = transaction.confidenceTier ?? 'medium';
  const tierPillStyle =
    tier === 'high' ? styles.confidenceHigh : tier === 'medium' ? styles.confidenceMedium : styles.confidenceLow;
  const tierTextStyle =
    tier === 'high' ? styles.confidenceHighText : tier === 'medium' ? styles.confidenceMediumText : styles.confidenceLowText;
  const reason = transaction.reviewReason ? REASON_LABEL[transaction.reviewReason] : null;

  const handleConfirm = () => onConfirm(transaction.id);
  const handleDismiss = () => onDismiss(transaction.id);

  // The card itself is not a button: confirming takes an explicit tap on "Add" (gap R2).
  return (
    <View style={styles.card}>
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
          <Text style={[styles.amountText, isCredit ? styles.creditAmount : styles.debitAmount]}>{formattedAmount}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.tagGroup}>
          <AutoDetectedBadge source={transaction.source} />
          {transaction.categoryName ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{transaction.categoryName}</Text>
            </View>
          ) : null}
          <View style={[styles.confidencePill, tierPillStyle]}>
            <Text style={tierTextStyle}>{TIER_LABEL[tier]}</Text>
          </View>
        </View>
        {reason ? (
          <Text style={styles.accountInfo} numberOfLines={1}>
            {reason}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          disabled={busy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Ignore detected transaction"
        >
          <Text style={styles.dismissText}>Ignore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={busy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add detected transaction"
        >
          <Text style={styles.confirmText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
