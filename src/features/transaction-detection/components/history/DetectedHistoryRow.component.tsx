import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { minorUnits, parseMoney } from '@budgetbrain/detection-core';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { DetectedTransactionDto } from '../../types/transactionDetection.types';
import { createStyles } from './DetectedHistoryRow.styles';

export interface DetectedHistoryRowProps {
  item: DetectedTransactionDto;
  onUndo: (id: string) => void;
  busy?: boolean;
}

const TYPE_LABEL = { expense: 'Expense', income: 'Income', refund: 'Refund', transfer: 'Transfer' } as const;
const STATUS_LABEL: Partial<Record<DetectedTransactionDto['status'], string>> = {
  auto_approved: 'Added automatically',
  user_confirmed: 'Confirmed by you',
};

export function DetectedHistoryRow({ item, onUndo, busy = false }: DetectedHistoryRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const amountMajor = parseMoney(item.amount, item.currency) / 10 ** minorUnits(item.currency);
  const isTransfer = item.transactionType === 'transfer';
  // A transfer leg shows which way the money moved between the user's own accounts.
  const sign = isTransfer ? (item.direction === 'CREDIT' ? '⇄ in ' : '⇄ out ') : item.direction === 'CREDIT' ? '+' : '−';
  const title = item.merchant ?? (item.accountTail ? `Account ••• ${item.accountTail}` : TYPE_LABEL[item.transactionType]);
  const subtitle = [
    TYPE_LABEL[item.transactionType],
    item.financialAccountName ?? (item.accountTail ? `••• ${item.accountTail}` : null),
    item.transactionDate,
  ]
    .filter(Boolean)
    .join(' · ');
  const handleUndo = () => onUndo(item.id);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Text style={styles.amount}>{`${sign}${formatCurrency(amountMajor, item.currency)}`}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.status}>{STATUS_LABEL[item.status] ?? ''}</Text>
        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndo}
          disabled={busy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Undo this detected transaction"
        >
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
