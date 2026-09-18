import { useMemo } from 'react';
import { RefreshControl, Share, StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import { BentoCard, ScreenLoader, AppHeaderBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import type { MonthlyRecap } from '@/shared/types';
import { createStyles } from './RecapScreen.styles';

export function RecapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { format } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['recap'],
    queryFn: () => apiGet<MonthlyRecap>('/reports/recap'),
  });

  const share = () => {
    if (!data) return;
    const lines = [
      `My spending recap`,
      `Total spent: ${format(data.totalSpent)}`,
      data.topCategory ? `Top category: ${data.topCategory.name} (${format(data.topCategory.amount)})` : null,
      data.biggestExpense ? `Biggest expense: ${data.biggestExpense.merchant ?? 'Unknown'} — ${format(data.biggestExpense.amount)}` : null,
      data.noSpendStreak > 0 ? `${data.noSpendStreak}-day no-spend streak` : null,
    ].filter(Boolean);
    void Share.share({ message: lines.join('\n') });
  };

  return (
    <View style={styles.root}>
      <AppHeaderBar
        title="BudgetBrain"
        subtitle="Spending Highlights"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
      >
        {isLoading || !data ? (
          <ScreenLoader />
        ) : (
          <>
            {/* Celebration Recap Hero Card */}
            <View style={styles.heroCard}>
              <LinearGradient
                colors={['rgba(14, 165, 233, 0.14)', 'rgba(139, 92, 246, 0.08)', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={styles.heroIconWrap}>
                <AppIcon name="sparkles" size={24} color={theme.colors.primary} />
              </View>

              <Text style={styles.heroLabel}>Total Spent This Month</Text>
              <Text style={styles.heroAmount}>{format(data.totalSpent)}</Text>

              {data.noSpendStreak > 0 ? (
                <View style={styles.streakPill}>
                  <AppIcon name="trendingUp" size={14} color={theme.colors.secondary} />
                  <Text style={styles.streakText}>
                    <Text style={{ fontWeight: '700', color: theme.colors.secondary }}>{data.noSpendStreak} Days</Text> No-Spend Streak
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Bento Highlights Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Key Insights</Text>
            </View>

            <View style={styles.grid}>
              {data.topCategory ? (
                <BentoCard
                  title="Top Category"
                  value={data.topCategory.name}
                  subtitle={format(data.topCategory.amount)}
                  accentColor={theme.colors.primary}
                  icon="category"
                  style={styles.cardItem}
                />
              ) : null}

              {data.biggestExpense ? (
                <BentoCard
                  title="Largest Single Outflow"
                  value={data.biggestExpense.merchant ?? 'Unknown'}
                  subtitle={format(data.biggestExpense.amount)}
                  accentColor={theme.colors.rose}
                  icon="expense"
                  style={styles.cardItem}
                />
              ) : null}

              <BentoCard
                title="Discipline Streak"
                value={`${data.noSpendStreak} Days`}
                subtitle="Zero non-essential spending"
                accentColor={theme.colors.secondary}
                icon="shield"
                style={styles.cardItem}
              />
            </View>

            {/* Share CTA Button */}
            <View style={styles.ctaWrap}>
              <Pressable
                onPress={share}
                style={({ pressed }) => [styles.shareBtnWrap, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.ocean]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shareBtnGradient}
                >
                  <AppIcon name="info" size={18} color="#FFFFFF" />
                  <Text style={styles.shareBtnText}>Share Monthly Recap</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

