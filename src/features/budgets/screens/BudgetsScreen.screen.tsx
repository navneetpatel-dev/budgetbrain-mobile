import { useMemo } from 'react';
import { RefreshControl, View, Text, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  EmptyState,
  ListRowsSkeleton,
  AppHeaderBar,
  RingGauge,
  FilterChipsRail,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { BudgetCard } from '@/features/budgets/components/BudgetCard.component';
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget.hook';
import { confirmDeleteBudget } from '@/features/budgets/services/confirmations';
import { showAlert } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import type { AiInsight } from '@/shared/types';
import { useBudgetsScreen } from '@/features/budgets/hooks/useBudgetsScreen.hook';
import { useEntitlement, PaywallModal } from '@/features/subscriptions';
import { useTabBarInset } from '@/shared/hooks/useTabBarInset.hook';
import { createStyles } from './BudgetsScreen.styles';

export function BudgetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabBarInset = useTabBarInset();
  const { isEntitled, paywallVisible, openPaywall, closePaywall } = useEntitlement();
  const { deleteBudget } = useDeleteBudget();
  const {
    budgets,
    isLoading,
    isError,
    refetch,
    isRefetching,
    activeFilter,
    setActiveFilter,
    totalSpent,
    totalLimit,
    overallProgress,
    currency,
    periodChips,
    dailySafe,
  } = useBudgetsScreen();

  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiGet<AiInsight>('/ai/insights'),
    retry: false,
  });

  const recommendation = useMemo(() => {
    return aiInsights?.structuredInsights?.find(
      (s) => s.kind === 'budget_recommendation' || s.kind === 'saving_opportunity'
    );
  }, [aiInsights]);

  const handleAddBudget = () => {
    if (!isEntitled && budgets.length >= 3) {
      openPaywall();
      return;
    }
    router.push('/budget/add');
  };

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar title="BudgetBrain" subtitle="Budgets Overview" />

      <FlatList
        data={isLoading ? [] : budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarInset }]}
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
                <Text style={styles.aiTitle}>
                  {recommendation?.title || 'AI Optimization Forecast'}
                </Text>
                <Text style={styles.aiDescription}>
                  {recommendation?.message ||
                    'You are tracking well this cycle. BudgetBrain suggests preserving surplus in discretionary categories to secure your month-end goal.'}
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
              onPress={handleAddBudget}
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
              onAction={handleAddBudget}
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

      <PaywallModal
        visible={paywallVisible}
        onClose={closePaywall}
        featureTitle="Unlimited Budget Categories"
      />
    </View>
  );
}
