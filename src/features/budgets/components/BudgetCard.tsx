import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Card, ProgressBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent, toSafeNumber } from '@/shared/utils/number';
import type { Budget } from '@/shared/types';

export function BudgetCard({
  budget,
  onDelete,
}: {
  budget: Budget;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const spent = budget.spent ?? 0;
  const effectiveLimit = budget.effectiveAmount ?? budget.amount;
  const rolloverAmount = budget.rolloverAmount ?? 0;
  const progress = toSafePercent(spent, effectiveLimit);
  const remaining = Math.max(0, Number(effectiveLimit) - spent);
  const isCritical = progress >= budget.alertThreshold || toSafeNumber(spent) > toSafeNumber(effectiveLimit);

  const goToEdit = () => router.push(appHref(`/budget/${budget.id}?edit=1`));

  return (
    <Card style={styles.budgetCard}>
      <View style={styles.content}>
        {/* Top Row: Icon, Title & Trailing Remaining Buffer */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <View
              style={[
                styles.iconPod,
                {
                  backgroundColor: isCritical
                    ? theme.colors.danger + '20'
                    : theme.colors.secondary + '20',
                },
              ]}
            >
              <AppIcon
                name={isCritical ? 'expense' : 'budgets'}
                size={22}
                color={isCritical ? theme.colors.danger : theme.colors.secondary}
              />
            </View>

            <View style={styles.titleMeta}>
              <Text style={styles.budgetName} numberOfLines={1}>
                {budget.name}
              </Text>
              <Text style={styles.budgetSub} numberOfLines={1}>
                {formatCurrency(spent, budget.currency)} of {formatCurrency(Number(effectiveLimit), budget.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.topRight}>
            <Text
              style={[
                styles.remainingAmount,
                isCritical && { color: theme.colors.danger },
              ]}
            >
              {formatCurrency(remaining, budget.currency)}
            </Text>
            <Text style={styles.remainingLabel}>
              {isCritical ? 'Critical Buffer' : 'Remaining'}
            </Text>
          </View>
        </View>

        {/* Progress Bar with Gradient Tint */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={8}
            color={isCritical ? theme.colors.danger : theme.colors.secondary}
          />
          <View style={styles.progressInfoRow}>
            <Text
              style={[
                styles.progressPctText,
                isCritical && { color: theme.colors.danger, fontWeight: '700' },
              ]}
            >
              {progress}% {isCritical ? 'consumed' : 'spent'}
            </Text>
            <Text style={styles.thresholdText}>
              {isCritical ? `Threshold ${budget.alertThreshold}%` : `${Math.max(0, 100 - progress)}% safe buffer`}
            </Text>
          </View>
        </View>

        {/* Warning Alert Tag if Critical */}
        {isCritical ? (
          <View style={styles.warningAlertRow}>
            <View style={styles.warningAlertLeft}>
              <AppIcon name="bell" size={15} color={theme.colors.danger} />
              <Text style={styles.warningAlertText} numberOfLines={1}>
                {progress}% reached — consider capping out-of-pocket
              </Text>
            </View>
            <Pressable
              onPress={goToEdit}
              style={({ pressed }) => [styles.adjustBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.adjustBtnText}>Adjust</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Rollover Active Tag */}
        {budget.rollover && rolloverAmount !== 0 ? (
          <View style={styles.rolloverRow}>
            <AppIcon name="sparkles" size={15} color={theme.colors.secondary} />
            <Text style={styles.rolloverText} numberOfLines={1}>
              Rollover active:{' '}
              <Text style={styles.rolloverAmount}>
                {rolloverAmount > 0 ? '+' : ''}
                {formatCurrency(rolloverAmount, budget.currency)}
              </Text>{' '}
              added from last period
            </Text>
          </View>
        ) : null}

        {/* Action icons footer (Edit / Delete) */}
        <View style={styles.cardFooter}>
          <Text style={styles.budgetType}>
            {`${budget.type.charAt(0).toUpperCase()}${budget.type.slice(1)}${budget.category?.name ? ` · ${budget.category.name}` : ''}`}
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={goToEdit}
              hitSlop={8}
              style={({ pressed }) => [styles.actionIconBtn, pressed && { opacity: 0.75 }]}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${budget.name}`}
            >
              <AppIcon name="edit" size={16} color={theme.colors.textTertiary} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              style={({ pressed }) => [styles.actionIconBtn, pressed && { opacity: 0.75 }]}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${budget.name}`}
            >
              <AppIcon name="trash" size={16} color={theme.colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </Card>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    budgetCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      marginBottom: 0,
    },
    content: {
      gap: t.spacing.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    iconPod: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    budgetName: {
      fontSize: 15,
      fontWeight: '600',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    budgetSub: {
      fontSize: 12,
      color: t.colors.textTertiary,
      fontWeight: '500',
    },
    topRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    remainingAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: t.colors.secondaryFixed,
      fontVariant: ['tabular-nums'],
    },
    remainingLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.2,
    },
    progressSection: {
      gap: 6,
    },
    progressInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressPctText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    thresholdText: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    warningAlertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.danger + '14',
      gap: 8,
    },
    warningAlertLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      minWidth: 0,
    },
    warningAlertText: {
      fontSize: 12,
      color: t.colors.danger,
      fontWeight: '500',
      flex: 1,
    },
    adjustBtn: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: t.colors.danger + '24',
    },
    adjustBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.danger,
    },
    rolloverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceHover,
    },
    rolloverText: {
      fontSize: 12,
      color: t.colors.textSecondary,
      flex: 1,
    },
    rolloverAmount: {
      fontWeight: '700',
      color: t.colors.secondaryFixed,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.borderSubtle,
    },
    budgetType: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
      textTransform: 'capitalize',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionIconBtn: {
      padding: 4,
    },
  });
}
