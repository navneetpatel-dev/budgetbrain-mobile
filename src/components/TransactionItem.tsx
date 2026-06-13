import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS } from '@/src/constants/config';
import type { Transaction } from '@/src/types';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: Props) {
  const isExpense = transaction.type === 'expense';
  const symbol = transaction.currency === 'INR' ? '₹' : transaction.currency;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: transaction.category?.color ?? COLORS.primary }]}>
        <Text style={styles.iconText}>{transaction.category?.name?.[0] ?? '?'}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.merchant}>{transaction.merchant ?? transaction.category?.name ?? 'Transaction'}</Text>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
      <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
        {isExpense ? '-' : '+'}
        {symbol}
        {Number(transaction.amount).toLocaleString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pressed: { opacity: 0.7 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  content: { flex: 1 },
  merchant: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
  expense: { color: COLORS.danger },
  income: { color: COLORS.success },
});
