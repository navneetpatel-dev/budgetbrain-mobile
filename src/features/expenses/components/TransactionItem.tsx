import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { AppIcon } from '@/src/features/navigation/components/AppIcon';
import { useTheme } from '@/src/shared/theme';
import { formatCurrency } from '@/src/shared/utils/currency';
import type { Transaction } from '@/src/shared/types';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  showBadge?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function TransactionItem({
  transaction,
  onPress,
  showBadge = false,
  isFirst,
  isLast,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isExpense = transaction.type === 'expense';
  const catColor = transaction.category?.color ?? theme.colors.primary;
  const formattedAmount = formatCurrency(Number(transaction.amount), transaction.currency);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isFirst && styles.first,
        !isLast && styles.rowDivider,
        isLast && styles.last,
        pressed && styles.pressed,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${transaction.merchant ?? transaction.category?.name ?? 'Transaction'}, ${formatDate(transaction.date)}`}
    >
      <View style={[styles.icon, { backgroundColor: catColor + '20' }]}>
        <Text style={[styles.iconText, { color: catColor }]}>
          {transaction.category?.name?.[0]?.toUpperCase() ?? (isExpense ? 'E' : 'I')}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant ?? transaction.category?.name ?? 'Transaction'}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
      <View style={styles.amountCol}>
        <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
          {isExpense ? '−' : '+'}
          {formattedAmount}
        </Text>
        {showBadge && (
          <View style={[styles.badge, isExpense ? styles.badgeExpense : styles.badgeIncome]}>
            <Text style={[styles.badgeText, isExpense ? styles.badgeTextExpense : styles.badgeTextIncome]}>
              {isExpense ? 'Expense' : 'Income'}
            </Text>
          </View>
        )}
      </View>
      {onPress && <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />}
    </Pressable>
  );
}

/** Wrap transaction items in a grouped list container */
export function TransactionGroup({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        group: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          overflow: 'hidden',
          ...theme.shadows.sm,
        },
      }),
    [theme]
  );
  return <View style={styles.group}>{children}</View>;
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: t.spacing.md,
      paddingHorizontal: t.spacing.lg,
      gap: t.spacing.md,
      backgroundColor: t.colors.surface,
    },
    first: {},
    last: {
      borderBottomWidth: 0,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    pressed: { backgroundColor: t.colors.surfaceHover },
    icon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: { fontWeight: '700', fontSize: 16 },
    content: { flex: 1 },
    merchant: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    date: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
    amountCol: { alignItems: 'flex-end' },
    amount: { ...t.typography.bodySemibold, fontSize: 15 },
    expense: { color: t.colors.danger },
    income: { color: t.colors.success },
    badge: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: t.radii.full,
    },
    badgeExpense: { backgroundColor: t.colors.dangerSoft },
    badgeIncome: { backgroundColor: t.colors.successSoft },
    badgeText: { fontSize: 10, fontWeight: '600' },
    badgeTextExpense: { color: t.colors.danger },
    badgeTextIncome: { color: t.colors.success },
  });
}
