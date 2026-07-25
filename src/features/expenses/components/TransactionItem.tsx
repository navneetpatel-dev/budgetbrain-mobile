import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { Transaction } from '@/shared/types';

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
  const accent =
    (isExpense ? transaction.category?.color : undefined) ?? theme.colors.primary;
  const formattedAmount = formatCurrency(Number(transaction.amount), transaction.currency);
  const title = isExpense
    ? (transaction.merchant ?? transaction.category?.name ?? 'Expense')
    : (transaction.incomeSource?.name ?? transaction.merchant ?? 'Income');
  const dateLabel = formatDate(transaction.date);
  const entityLabel = isExpense
    ? transaction.category?.name
    : transaction.incomeSource?.name;
  const a11yMeta = entityLabel ? `${dateLabel}, ${entityLabel}` : dateLabel;

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
      accessibilityLabel={`${title}, ${a11yMeta}`}
    >
      <View style={[styles.icon, { backgroundColor: accent + '18' }]}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.merchant} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date} numberOfLines={1}>
            {dateLabel}
          </Text>
          {entityLabel ? (
            <View
              style={[
                styles.entityChip,
                { backgroundColor: accent + '18', borderColor: accent + '44' },
              ]}
            >
              <Text style={[styles.entityChipText, { color: accent }]} numberOfLines={1}>
                {entityLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.trailing}>
        <View style={styles.amountRow}>
          <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
            {isExpense ? '−' : '+'}
            {formattedAmount}
          </Text>
          {onPress ? <AppIcon name="chevronRight" size={15} color={theme.colors.textTertiary} /> : null}
        </View>
        {showBadge ? (
          <View
            style={[
              styles.badge,
              isExpense ? styles.badgeExpense : styles.badgeIncome,
              onPress ? styles.badgeWithChevron : null,
            ]}
          >
            <Text style={[styles.badgeText, isExpense ? styles.badgeTextExpense : styles.badgeTextIncome]}>
              {isExpense ? 'Expense' : 'Income'}
            </Text>
          </View>
        ) : null}
      </View>
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
          borderRadius: theme.radii.xl,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          overflow: 'hidden',
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
      paddingVertical: 18,
      paddingHorizontal: t.spacing.lg,
      gap: 14,
      backgroundColor: t.colors.surface,
      minHeight: 88,
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
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: { width: 12, height: 12, borderRadius: 6 },
    content: { flex: 1, minWidth: 0, gap: 6 },
    merchant: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.1,
      color: t.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    date: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    entityChip: {
      maxWidth: '70%',
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      borderWidth: 1,
    },
    entityChipText: {
      fontSize: 11,
      fontWeight: '600',
    },
    trailing: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 5,
      minWidth: 84,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    amount: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.1,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
    expense: { color: t.colors.danger },
    income: { color: t.colors.success },
    badge: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      alignSelf: 'flex-end',
    },
    badgeWithChevron: {
      marginRight: 23,
    },
    badgeExpense: { backgroundColor: t.colors.dangerSoft },
    badgeIncome: { backgroundColor: t.colors.successSoft },
    badgeText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
    badgeTextExpense: { color: t.colors.danger },
    badgeTextIncome: { color: t.colors.success },
  });
}
