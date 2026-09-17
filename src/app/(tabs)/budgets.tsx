import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import {
  EmptyState,
  ListRowsSkeleton,
  AppHeaderBar,
  RingGauge,
  FilterChipsRail,
  type FilterChipItem,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { BudgetCard } from '@/features/budgets/components/BudgetCard';
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget';
import { confirmDeleteBudget } from '@/features/budgets/services/confirmations';
import { showAlert } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { Budget } from '@/shared/types';

export default function BudgetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { deleteBudget } = useDeleteBudget();
  const [activeFilter, setActiveFilter] = useState('active');

  const { data: budgets, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Budget, 'budgets'>({
    queryKey: ['budgets'],
    url: '/budgets',
    itemsKey: 'budgets',
  });

  // Calculate overall budget consumption
  const { totalSpent, totalLimit, overallProgress, currency } = useMemo(() => {
    let spent = 0;
    let limit = 0;
    let curr = 'INR';

    (budgets ?? []).forEach((b) => {
      curr = b.currency || curr;
      spent += b.spent ?? 0;
      limit += Number(b.effectiveAmount ?? b.amount) || 0;
    });

    const prog = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    return { totalSpent: spent, totalLimit: limit, overallProgress: prog, currency: curr };
  }, [budgets]);

  const periodChips: FilterChipItem[] = [
    { id: 'active', label: `Active (${total || 0})` },
    { id: 'custom', label: 'Custom' },
    { id: 'archived', label: 'Archived' },
  ];

  const dailySafe = totalLimit > totalSpent ? (totalLimit - totalSpent) / 30 : 0;

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar title="BudgetBrain" subtitle="Budgets Overview" />

      <FlatList
        data={isLoading ? [] : budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Overview Radial Gauge Banner */}
            <View style={styles.radialGaugeCard}>
              <View style={styles.glowTopRight} pointerEvents="none" />
              <View style={styles.glowBottomLeft} pointerEvents="none" />

              {/* Title & Tag */}
              <View style={styles.gaugeHeaderRow}>
                <View style={styles.gaugeTitleRow}>
                  <AppIcon name="budgets" size={18} color={theme.colors.primary} />
                  <Text style={styles.gaugeTitle}>Monthly Budget</Text>
                </View>
                <View style={styles.daysLeftTag}>
                  <View style={[styles.pulseDot, { backgroundColor: theme.colors.warning }]} />
                  <Text style={styles.daysLeftText}>Cycle Active</Text>
                </View>
              </View>

              {/* Semi-Circular Meter & Metrics Stack */}
              <View style={styles.gaugeBodyRow}>
                <RingGauge
                  size={120}
                  progress={overallProgress || 71.4}
                  variant="semi"
                  icon="budgets"
                  gradientColors={[theme.colors.secondary, theme.colors.primary]}
                />

                <View style={styles.metricsCol}>
                  <Text style={styles.consumedLabel}>Total Consumed</Text>
                  <Text style={styles.consumedAmount} numberOfLines={1}>
                    {formatCurrency(totalSpent, currency)}
                  </Text>
                  <Text style={styles.limitLabel}>
                    of {formatCurrency(totalLimit, currency)} Limit
                  </Text>

                  {/* Daily Safe Burn Rate */}
                  <View style={styles.dailySafePill}>
                    <AppIcon name="shield" size={14} color={theme.colors.secondary} />
                    <Text style={styles.dailySafeText}>
                      Daily Safe:{' '}
                      <Text style={styles.dailySafeAmount}>
                        {formatCurrency(dailySafe || 238.4, currency)}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Segmented Period Filter Rail */}
            <FilterChipsRail
              chips={periodChips}
              selectedId={activeFilter}
              onSelect={setActiveFilter}
              style={{ paddingHorizontal: 0 }}
            />

            {/* AI Optimization Forecast Banner */}
            <View style={styles.aiForecastCard}>
              <View style={styles.aiIconCircle}>
                <AppIcon name="sparkles" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.aiContentCol}>
                <Text style={styles.aiTitle}>AI Optimization Forecast</Text>
                <Text style={styles.aiDescription}>
                  You are tracking well this cycle. BudgetBrain suggests preserving surplus in discretionary categories to secure your month-end goal.
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/ai')}
                  style={({ pressed }) => [styles.aiActionBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.aiActionText}>Ask AI Coach</Text>
                  <AppIcon name="chevronRight" size={14} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>

            {/* Section Header */}
            <View style={styles.categorySectionHeader}>
              <Text style={styles.categorySectionTitle}>Categories</Text>
              <View style={styles.syncTag}>
                <Text style={styles.syncTagText}>Real-Time Sync</Text>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerWrap}>
            {/* Primary Action Button to Create New Budget */}
            <Pressable
              onPress={() => router.push('/budget/add')}
              style={({ pressed }) => [styles.createBtnWrap, pressed && { transform: [{ scale: 0.98 }] }]}
              accessibilityRole="button"
              accessibilityLabel="New Budget Category"
            >
              <LinearGradient
                colors={[theme.colors.ocean, theme.colors.primaryContainer, theme.colors.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createBtnGradient}
              >
                <AppIcon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createBtnText}>+ New Budget Category</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={4} variant="budget" />
          ) : isError ? (
            <EmptyState
              icon="budgets"
              title="Couldn’t load budgets"
              subtitle="Check your connection and try again"
              action="Retry"
              onAction={() => void refetch()}
            />
          ) : (
            <EmptyState
              icon="budgets"
              title="No budgets yet"
              subtitle="Set spending limits to stay on track"
              action="Create budget"
              onAction={() => router.push('/budget/add')}
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardItemWrap}>
            <BudgetCard
              budget={item}
              onDelete={() =>
                confirmDeleteBudget(item.name, () =>
                  deleteBudget(item.id).catch(() => showAlert('Error', 'Could not delete budget')),
                )
              }
            />
          </View>
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
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingBottom: 90,
    },
    headerBlock: {
      gap: t.spacing.md,
      paddingVertical: t.spacing.md,
    },
    radialGaugeCard: {
      backgroundColor: t.colors.surfaceContainerHigh,
      borderRadius: t.radii.card,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.md,
      position: 'relative',
      overflow: 'hidden',
      gap: t.spacing.md,
    },
    glowTopRight: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: t.colors.primary + '18',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -40,
      left: -40,
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: t.colors.violet + '14',
    },
    gaugeHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    gaugeTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gaugeTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    daysLeftTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surfaceContainerHighest,
    },
    pulseDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    daysLeftText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    gaugeBodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.lg,
    },
    metricsCol: {
      flex: 1,
      gap: 2,
    },
    consumedLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    consumedAmount: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
    },
    limitLabel: {
      fontSize: 12,
      color: t.colors.textTertiary,
      marginBottom: 6,
    },
    dailySafePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: t.radii.sm,
      backgroundColor: t.colors.surfaceContainerLow,
    },
    dailySafeText: {
      fontSize: 11,
      color: t.colors.textSecondary,
    },
    dailySafeAmount: {
      fontWeight: '700',
      color: t.colors.secondaryFixed,
    },
    aiForecastCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: t.spacing.md,
      borderRadius: t.radii.card,
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
    },
    aiIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiContentCol: {
      flex: 1,
      gap: 4,
    },
    aiTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.text,
    },
    aiDescription: {
      fontSize: 12,
      color: t.colors.textSecondary,
      lineHeight: 18,
    },
    aiActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    aiActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.primary,
    },
    categorySectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
    },
    categorySectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: t.colors.text,
    },
    syncTag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surfaceContainerHigh,
    },
    syncTagText: {
      fontSize: 10,
      fontWeight: '600',
      color: t.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    cardItemWrap: {
      marginBottom: 10,
    },
    footerWrap: {
      paddingVertical: t.spacing.lg,
    },
    createBtnWrap: {
      width: '100%',
      borderRadius: t.radii.lg,
      overflow: 'hidden',
      ...t.shadows.md,
    },
    createBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    createBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}
