import { useMemo } from 'react';
import { RefreshControl, View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { EmptyState, ListRowsSkeleton, AppHeaderBar, RingGauge, FilterChipsRail } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { useDeleteGoal } from '@/features/goals/hooks/useDeleteGoal';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showAlert, showConfirmation } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useGoalsScreen } from '@/features/goals/hooks/useGoalsScreen.hook';
import { createStyles } from './GoalsScreen.styles';

export function GoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { deleteGoal } = useDeleteGoal();
  const {
    isLoading,
    isError,
    refetch,
    isRefetching,
    activeFilter,
    setActiveFilter,
    totalSaved,
    totalTarget,
    overallProgress,
    currency,
    achievedCount,
    filterChips,
    filteredGoals,
  } = useGoalsScreen();

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
