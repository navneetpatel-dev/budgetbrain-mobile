import { useMemo } from 'react';
import { RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import { Button, Card, ScreenLoader, StackScrollScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import type { MonthlyRecap } from '@/shared/types';

export default function RecapScreen() {
  const theme = useTheme();
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
    <StackScrollScreen
      header={<ProfileStackHeader screen="recap" subtitle="Your monthly highlights" />}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
    >
      {isLoading || !data ? (
        <ScreenLoader />
      ) : (
        <>
          <Card variant="elevated" style={styles.hero}>
            <Text style={styles.heroLabel}>Total spent this month</Text>
            <Text style={styles.heroAmount}>{format(data.totalSpent)}</Text>
          </Card>

          <View style={styles.grid}>
            {data.topCategory ? (
              <Card style={styles.tile}>
                <Text style={styles.tileLabel}>Top category</Text>
                <Text style={styles.tileValue}>{data.topCategory.name}</Text>
                <Text style={styles.tileSub}>{format(data.topCategory.amount)}</Text>
              </Card>
            ) : null}
            {data.biggestExpense ? (
              <Card style={styles.tile}>
                <Text style={styles.tileLabel}>Biggest expense</Text>
                <Text style={styles.tileValue}>{data.biggestExpense.merchant ?? 'Unknown'}</Text>
                <Text style={styles.tileSub}>{format(data.biggestExpense.amount)}</Text>
              </Card>
            ) : null}
            <Card style={styles.tile}>
              <Text style={styles.tileLabel}>No-spend streak</Text>
              <Text style={styles.tileValue}>{data.noSpendStreak} days</Text>
            </Card>
          </View>

          <Button title="Share recap" onPress={share} />
        </>
      )}
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    hero: { alignItems: 'center', paddingVertical: t.spacing.xl, marginBottom: t.spacing.lg },
    heroLabel: { ...t.typography.caption, fontWeight: '600', color: t.colors.textSecondary },
    heroAmount: { ...t.typography.amountLg, color: t.colors.text, marginTop: t.spacing.xs },
    grid: { gap: t.spacing.sm, marginBottom: t.spacing.xl },
    tile: { marginBottom: 0 },
    tileLabel: { ...t.typography.label, color: t.colors.textTertiary },
    tileValue: { ...t.typography.bodySemibold, fontWeight: '700', color: t.colors.text, marginTop: t.spacing.xs },
    tileSub: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 },
  });
}
