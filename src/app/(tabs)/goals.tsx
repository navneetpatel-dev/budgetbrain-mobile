import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  EmptyState,
  ListRowsSkeleton,
  AppHeaderBar,
  RingGauge,
  FilterChipsRail,
  type FilterChipItem,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { useDeleteGoal } from '@/features/goals/hooks/useDeleteGoal';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showAlert, showConfirmation } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { Goal } from '@/shared/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { deleteGoal } = useDeleteGoal();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'achieved'>('all');

  const { data: goals, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Goal, 'goals'>({
    queryKey: ['goals'],
    url: '/goals',
    itemsKey: 'goals',
  });

  // Calculate cumulative goals metrics
  const { totalSaved, totalTarget, overallProgress, currency, activeCount, achievedCount } = useMemo(() => {
    let saved = 0;
    let target = 0;
    let curr = 'INR';
    let active = 0;
    let achieved = 0;

    (goals ?? []).forEach((g) => {
      curr = g.currency || curr;
      const current = Number(g.currentAmount) || 0;
      const tgt = Number(g.targetAmount) || 0;
      saved += current;
      target += tgt;
      if (tgt > 0 && current >= tgt) {
        achieved += 1;
      } else {
        active += 1;
      }
    });

    const prog = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return {
      totalSaved: saved,
      totalTarget: target,
      overallProgress: prog,
      currency: curr,
      activeCount: active,
      achievedCount: achieved,
    };
  }, [goals]);

  // Filtered goals based on selection
  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    if (activeFilter === 'active') {
      return goals.filter((g) => Number(g.currentAmount) < Number(g.targetAmount));
    }
    if (activeFilter === 'achieved') {
      return goals.filter((g) => Number(g.currentAmount) >= Number(g.targetAmount));
    }
    return goals;
  }, [goals, activeFilter]);

  const filterChips: FilterChipItem[] = [
    { id: 'all', label: `All (${total || 0})` },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'achieved', label: `Achieved (${achievedCount})` },
  ];

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar
        title="BudgetBrain"
        subtitle="Savings Goals"
        rightAction={
          <Pressable
            onPress={() => router.push('/goal/add')}
            style={({ pressed }) => [styles.headerAddBtn, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel="Create goal"
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.ocean]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerAddGradient}
            >
              <AppIcon name="add" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        }
      />

      <FlatList
        data={isLoading ? [] : filteredGoals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Overview Radial Semi-Gauge Card */}
            <View style={styles.radialGaugeCard}>
              <View style={styles.glowTopRight} pointerEvents="none" />
              <View style={styles.glowBottomLeft} pointerEvents="none" />

              {/* Title & Tag */}
              <View style={styles.gaugeHeaderRow}>
                <View style={styles.gaugeTitleRow}>
                  <AppIcon name="goals" size={18} color={theme.colors.secondary} />
                  <Text style={styles.gaugeTitle}>Cumulative Savings</Text>
                </View>
                <View style={styles.statusTag}>
                  <View style={[styles.pulseDot, { backgroundColor: theme.colors.secondary }]} />
                  <Text style={styles.statusTagText}>
                    {achievedCount > 0 ? `${achievedCount} Achieved` : 'Building Wealth'}
                  </Text>
                </View>
              </View>

              {/* Semi-Circular Meter & Metrics Stack */}
              <View style={styles.gaugeBodyRow}>
                <RingGauge
                  size={120}
                  progress={overallProgress || (totalTarget > 0 ? 0 : 50)}
                  variant="semi"
                  icon="goals"
                  gradientColors={[theme.colors.secondary, theme.colors.primary]}
                />

                <View style={styles.metricsCol}>
                  <Text style={styles.savedLabel}>Total Saved</Text>
                  <Text style={styles.savedAmount} numberOfLines={1}>
                    {formatCurrency(totalSaved, currency)}
                  </Text>
                  <Text style={styles.targetLabel}>
                    of {formatCurrency(totalTarget, currency)} Goal
                  </Text>

                  {/* Savings Run-Rate Pill */}
                  <View style={styles.ratePill}>
                    <AppIcon name="trendingUp" size={14} color={theme.colors.secondary} />
                    <Text style={styles.rateText}>
                      Progress: <Text style={styles.rateHighlight}>{overallProgress}%</Text> achieved
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Filter Chips Rail */}
            <FilterChipsRail
              chips={filterChips}
              selectedId={activeFilter}
              onSelect={(id) => setActiveFilter(id as 'all' | 'active' | 'achieved')}
              style={{ paddingHorizontal: 0 }}
            />

            {/* Sub-header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Targets & Milestones</Text>
              <Text style={styles.sectionCount}>
                {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <Pressable
              onPress={() => router.push('/goal/add')}
              style={({ pressed }) => [styles.createBtnWrap, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.ocean]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createBtnGradient}
              >
                <AppIcon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createBtnText}>Create New Savings Goal</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={3} variant="goal" />
          ) : isError ? (
            <EmptyState
              title="Couldn’t load goals"
              subtitle="Check your connection and try again"
              icon="goals"
              action="Retry"
              onAction={() => void refetch()}
            />
          ) : (
            <EmptyState
              title="No goals found"
              subtitle="Create your first financial target to track your progress"
              icon="goals"
              action="Create goal"
              onAction={() => router.push('/goal/add')}
            />
          )
        }
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onDelete={() =>
              showConfirmation(CONFIRM.deleteGoal, () =>
                deleteGoal(item.id).catch(() => showAlert('Error', 'Could not delete goal')),
              )
            }
          />
        )}
      />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    headerAddBtn: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    headerAddGradient: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: 120,
    },
    headerBlock: {
      marginBottom: t.spacing.md,
    },
    radialGaugeCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 18,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
      marginBottom: t.spacing.md,
    },
    glowTopRight: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(78, 222, 163, 0.08)',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(14, 165, 233, 0.06)',
    },
    gaugeHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    gaugeTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gaugeTitle: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    statusTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.12)' : t.colors.secondaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(78, 222, 163, 0.3)' : 'transparent',
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    gaugeBodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    metricsCol: {
      flex: 1,
      justifyContent: 'center',
    },
    savedLabel: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    savedAmount: {
      ...t.typography.amount,
      fontSize: 26,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.6,
      marginVertical: 2,
    },
    targetLabel: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontWeight: '500',
      marginBottom: 10,
    },
    ratePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.08)' : 'rgba(78, 222, 163, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    rateText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textSecondary,
    },
    rateHighlight: {
      fontWeight: '700',
      color: t.colors.secondary,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: t.spacing.md,
      marginBottom: t.spacing.xs,
    },
    sectionTitle: {
      ...t.typography.titleSm,
      fontSize: 17,
      fontWeight: '700',
      color: t.colors.text,
    },
    sectionCount: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontWeight: '600',
    },
    footerWrap: {
      marginTop: t.spacing.md,
    },
    createBtnWrap: {
      borderRadius: 14,
      overflow: 'hidden',
    },
    createBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    createBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
  });
}
