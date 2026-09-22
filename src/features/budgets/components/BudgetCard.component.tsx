import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Card, ProgressBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafeNumber } from '@/shared/utils/number';
import type { Budget } from '@/shared/types';
import { createStyles } from './BudgetCard.styles';

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
  // Server-computed (0-100, capped) — never derive from spent/effectiveLimit client-side.
  const progress = budget.spentPercentage ?? 0;
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
