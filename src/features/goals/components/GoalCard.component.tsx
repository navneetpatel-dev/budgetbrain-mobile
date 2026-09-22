import { memo, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import type { Goal } from '@/shared/types';
import { createStyles } from './GoalCard.styles';

export const GoalCard = memo(function GoalCard({
  goal,
  onDelete,
}: {
  goal: Goal;
  /** Takes the goal id (not a pre-bound callback) so the parent list can pass one stable
   * function reference for every row instead of a fresh closure per row. */
  onDelete: (id: string) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const cardSpring = useSpringPress(0.98);
  const editSpring = useSpringPress();
  const deleteSpring = useSpringPress();
  const contributeSpring = useSpringPress();
  // Server-computed — do not derive from currentAmount/targetAmount client-side (MOBILE doc §12).
  const progress = goal.progressPercentage;
  const isCompleted = goal.completedAt != null;

  const openGoal = () => router.push(appHref(`/goal/${goal.id}`));
  const contribute = () => router.push(appHref(`/goal/${goal.id}/contribute`));

  // Determine target date string
  const targetDateLabel = useMemo(() => {
    if (!goal.targetDate) return null;
    const d = new Date(goal.targetDate);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }, [goal.targetDate]);

  return (
    <Pressable
      onPress={openGoal}
      onPressIn={cardSpring.onPressIn}
      onPressOut={cardSpring.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open ${goal.name}`}
    >
    <Animated.View style={[styles.card, cardSpring.style]}>
      {/* Ambient gradient glow */}
      <LinearGradient
        colors={
          isCompleted
            ? ['rgba(78, 222, 163, 0.12)', 'transparent']
            : ['rgba(14, 165, 233, 0.10)', 'transparent']
        }
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.8 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconAndTitle}>
          <LinearGradient
            colors={
              isCompleted
                ? [theme.colors.secondary + '28', theme.colors.secondary + '0A']
                : [theme.colors.primary + '28', theme.colors.gradientEnd + '0A']
            }
            style={styles.iconPod}
          >
            <AppIcon
              name={isCompleted ? 'checkmark' : 'goals'}
              size={18}
              color={isCompleted ? theme.colors.secondary : theme.colors.primary}
            />
          </LinearGradient>
          <View style={styles.titleCol}>
            <Text style={styles.goalName} numberOfLines={1}>
              {goal.name}
            </Text>
            <View style={styles.badgeRow}>
              <Text style={styles.goalType}>{goal.type.replace(/_/g, ' ')}</Text>
              {targetDateLabel ? (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.targetDateText}>Target: {targetDateLabel}</Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={openGoal}
            onPressIn={editSpring.onPressIn}
            onPressOut={editSpring.onPressOut}
            hitSlop={8}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${goal.name}`}
          >
            <Animated.View style={editSpring.style}>
              <AppIcon name="edit" size={16} color={theme.colors.textSecondary} />
            </Animated.View>
          </Pressable>
          <Pressable
            onPress={() => showConfirmation(CONFIRM.deleteGoal, () => onDelete(goal.id))}
            onPressIn={deleteSpring.onPressIn}
            onPressOut={deleteSpring.onPressOut}
            hitSlop={8}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${goal.name}`}
          >
            <Animated.View style={deleteSpring.style}>
              <AppIcon name="trash" size={16} color={theme.colors.danger} />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* Amount & Progress Section */}
      <View style={styles.metricRow}>
        <View style={styles.amountsCol}>
          <Text style={styles.amountLabel}>Saved</Text>
          <Text style={styles.currentAmount} numberOfLines={1}>
            {formatCurrency(Number(goal.currentAmount), goal.currency)}
          </Text>
          <Text style={styles.targetAmount}>
            Target: {formatCurrency(Number(goal.targetAmount), goal.currency)}
          </Text>
        </View>

        <View
          style={[
            styles.progressBadge,
            {
              backgroundColor: isCompleted
                ? theme.colors.secondary + '1F'
                : theme.colors.primary + '1A',
              borderColor: isCompleted
                ? theme.colors.secondary + '44'
                : theme.colors.primary + '33',
            },
          ]}
        >
          <Text
            style={[
              styles.progressBadgeText,
              { color: isCompleted ? theme.colors.secondary : theme.colors.primary },
            ]}
          >
            {isCompleted ? 'Achieved' : `${progress}%`}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.trackBackground}>
        <LinearGradient
          colors={
            isCompleted
              ? [theme.colors.secondary, '#6FFBBE']
              : [theme.colors.primary, theme.colors.ocean]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.trackFill, { width: `${Math.min(100, progress)}%` }]}
        />
      </View>

      {/* Bottom Actions Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.remainingText}>
          {isCompleted
            ? 'Goal reached! 🎉'
            : `${formatCurrency(Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount)), goal.currency)} left`}
        </Text>

        {!isCompleted ? (
          <Pressable
            onPress={contribute}
            onPressIn={contributeSpring.onPressIn}
            onPressOut={contributeSpring.onPressOut}
            style={styles.contributeBtn}
            accessibilityRole="button"
            accessibilityLabel={`Contribute to ${goal.name}`}
          >
            <Animated.View style={contributeSpring.style}>
              <LinearGradient
                colors={[theme.colors.primary + '25', theme.colors.secondary + '20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.contributeGradient}
              >
                <AppIcon name="add" size={14} color={theme.colors.primary} />
                <Text style={styles.contributeText}>Contribute</Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
    </Pressable>
  );
});
