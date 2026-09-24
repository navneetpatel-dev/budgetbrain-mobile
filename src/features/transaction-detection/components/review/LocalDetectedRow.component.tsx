import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { minorUnits, parseMoney } from '@budgetbrain/detection-core';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { LocalPendingItem } from '../../services/store/detectionStore.service';
import { createStyles } from './LocalDetectedRow.styles';

export interface LocalDetectedRowProps {
  item: LocalPendingItem;
  onDiscard: (clientId: string) => void;
}

const TYPE_LABEL = { expense: 'Expense', income: 'Income', refund: 'Refund', transfer: 'Transfer' } as const;

/**
 * A transaction detected on this device that hasn't reached the server yet (plan T5.1). It shows
 * offline; it can be deleted now, and confirmed or edited once it has synced.
 */
export function LocalDetectedRow({ item, onDiscard }: LocalDetectedRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const p = item.payload;
  const amountMajor = parseMoney(p.amount, p.currency) / 10 ** minorUnits(p.currency);
  const sign = p.transactionType === 'transfer' ? '⇄ ' : p.direction === 'CREDIT' ? '+' : '−';
  const title = p.merchantName ?? (p.accountTail ? `Account ••• ${p.accountTail}` : TYPE_LABEL[p.transactionType]);
  const subtitle = [TYPE_LABEL[p.transactionType], p.accountTail ? `••• ${p.accountTail}` : null, p.transactionDate]
    .filter(Boolean)
    .join(' · ');
  const handleDiscard = () => onDiscard(p.clientId);

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
        <Text style={styles.amount}>{`${sign}${formatCurrency(amountMajor, p.currency)}`}</Text>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Waiting to sync</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDiscard}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Delete this detected transaction before it syncs"
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
