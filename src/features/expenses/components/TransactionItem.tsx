import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
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
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function getCategoryIcon(name?: string, isExpense?: boolean): AppIconName {
  if (!isExpense) return 'income';
  const lower = (name ?? '').toLowerCase();
  if (lower.includes('food') || lower.includes('dine') || lower.includes('cafe')) return 'activity';
  if (lower.includes('groc') || lower.includes('market')) return 'activity';
  if (lower.includes('transit') || lower.includes('uber') || lower.includes('travel') || lower.includes('car')) return 'activity';
  if (lower.includes('bill') || lower.includes('util') || lower.includes('electric')) return 'sparkles';
  if (lower.includes('tech') || lower.includes('apple') || lower.includes('gadget') || lower.includes('device')) return 'sparkles';
  if (lower.includes('entertain') || lower.includes('stream') || lower.includes('movie')) return 'sparkles';
  return 'expense';
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
    (isExpense ? transaction.category?.color : undefined) ??
    (isExpense ? theme.colors.rose : theme.colors.secondary);

  const formattedAmount = formatCurrency(Number(transaction.amount), transaction.currency);
  const title = isExpense
    ? (transaction.merchant ?? transaction.category?.name ?? 'Expense')
    : (transaction.incomeSource?.name ?? transaction.merchant ?? 'Income');
  const dateLabel = formatDate(transaction.date);
  const entityLabel = isExpense
    ? transaction.category?.name
    : transaction.incomeSource?.name;

  const paymentLabel = transaction.paymentMethod
    ? transaction.paymentMethod.toUpperCase()
    : 'Card';

  const iconName = getCategoryIcon(entityLabel ?? title, isExpense);

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
      accessibilityLabel={`${title}, ${formattedAmount}`}
    >
      {/* 44px Rounded Icon Pod with Corner Glyph Badge */}
      <View style={[styles.iconPod, { backgroundColor: accent + '1E' }]}>
        <AppIcon
          name={iconName}
          size={20}
          color={accent}
        />
        <View style={styles.cornerBadge}>
          <AppIcon
            name={isExpense ? 'wallet' : 'checkmark'}
            size={9}
            color={theme.colors.textSecondary}
          />
        </View>
      </View>

      {/* Title & Metadata */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.merchant} numberOfLines={1}>
            {title}
          </Text>
          {entityLabel ? (
            <View style={[styles.entityTag, { backgroundColor: theme.colors.surfaceHover }]}>
              <Text style={styles.entityTagText} numberOfLines={1}>
                {entityLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.paymentMethod} numberOfLines={1}>
            {paymentLabel}
          </Text>
          <View style={styles.metaDivider} />
          <Text style={styles.date} numberOfLines={1}>
            {dateLabel}
          </Text>
        </View>
      </View>

      {/* Trailing Tabular Amount & Subtitle */}
      <View style={styles.trailing}>
        <Text style={[styles.amount, isExpense ? styles.expense : styles.income]} numberOfLines={1}>
          {isExpense ? '−' : '+'}
          {formattedAmount}
        </Text>
        <Text
          style={[
            styles.statusSub,
            !isExpense && { color: theme.colors.secondary },
          ]}
          numberOfLines={1}
        >
          {isExpense ? 'Completed' : 'Verified'}
        </Text>
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
          borderRadius: theme.radii.card,
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
      paddingVertical: 14,
      paddingHorizontal: t.spacing.md,
      gap: 12,
      backgroundColor: t.colors.surface,
      minHeight: 72,
    },
    first: {},
    last: {
      borderBottomWidth: 0,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    pressed: {
      backgroundColor: t.colors.surfaceHover,
    },
    iconPod: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    cornerBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: t.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    content: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    merchant: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: t.colors.text,
      flexShrink: 1,
    },
    entityTag: {
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 6,
    },
    entityTagText: {
      fontSize: 10,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    paymentMethod: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    metaDivider: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: t.colors.textTertiary,
    },
    date: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    trailing: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 3,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.2,
      fontVariant: ['tabular-nums'],
    },
    expense: {
      color: t.colors.text,
    },
    income: {
      color: t.colors.secondary,
    },
    statusSub: {
      fontSize: 11,
      color: t.colors.textTertiary,
      fontWeight: '500',
    },
  });
}
