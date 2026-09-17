import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { Goal } from '@/shared/types';

export function GoalCard({
  goal,
  onDelete,
}: {
  goal: Goal;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const progress = toSafePercent(goal.currentAmount, goal.targetAmount);
  const isCompleted = progress >= 100;

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
    <View style={styles.card}>
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
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${goal.name}`}
          >
            <AppIcon name="edit" size={16} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${goal.name}`}
          >
            <AppIcon name="trash" size={16} color={theme.colors.danger} />
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
            style={({ pressed }) => [styles.contributeBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`Contribute to ${goal.name}`}
          >
            <LinearGradient
              colors={[theme.colors.primary + '25', theme.colors.secondary + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contributeGradient}
            >
              <AppIcon name="add" size={14} color={theme.colors.primary} />
              <Text style={styles.contributeText}>Contribute</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: t.spacing.lg,
      marginBottom: t.spacing.md,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: t.spacing.md,
    },
    iconAndTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    iconPod: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    titleCol: {
      flex: 1,
    },
    goalName: {
      ...t.typography.titleSm,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      gap: 6,
    },
    goalType: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      textTransform: 'capitalize',
      fontSize: 12,
    },
    dotSeparator: {
      color: t.colors.textTertiary,
      fontSize: 10,
    },
    targetDateText: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontSize: 12,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.05)' : t.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    actionBtnPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 10,
    },
    amountsCol: {
      flex: 1,
    },
    amountLabel: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      fontSize: 11,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    currentAmount: {
      ...t.typography.amount,
      fontSize: 24,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.5,
    },
    targetAmount: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: 2,
      fontWeight: '500',
    },
    progressBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    progressBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    trackBackground: {
      height: 7,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      borderRadius: 999,
      overflow: 'hidden',
      marginBottom: 12,
    },
    trackFill: {
      height: '100%',
      borderRadius: 999,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    remainingText: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontWeight: '500',
    },
    contributeBtn: {
      borderRadius: 10,
      overflow: 'hidden',
    },
    contributeGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.colors.primary + '40',
    },
    contributeText: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.primary,
    },
  });
}
