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
    dot: { width: 10, height: 10, borderRadius: 5 },
    content: { flex: 1, minWidth: 0 },
    merchant: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    date: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    entityChip: {
      maxWidth: '70%',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: t.radii.full,
      borderWidth: 1,
    },
    entityChipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    amountCol: { alignItems: 'flex-end' },
    amount: { ...t.typography.bodySemibold, fontSize: 15, fontVariant: ['tabular-nums'] },
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
