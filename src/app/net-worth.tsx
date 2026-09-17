import { useMemo } from 'react';
import { StyleSheet, Text, RefreshControl, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import {
  BentoCard,
  SegmentedMacroBar,
  NetWorthSkeleton,
  GroupedCard,
  ListRow,
  EmptyState,
  AppHeaderBar,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';

interface NetWorthData {
  summary: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    bankBalance: number;
    creditCardDebt: number;
    investmentValue: number;
    currency: string;
  };
  accounts: Array<{ id: string; name: string; type: string; balance: number; institution: string | null }>;
  investments: Array<{ id: string; name: string; type: string; currentValue: number; gainLoss: number }>;
}

export default function NetWorthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthData>('/net-worth'),
  });

  const s = data?.summary;
  const currency = s?.currency ?? 'INR';
  const accounts = data?.accounts ?? [];
  const investments = data?.investments ?? [];
  const isEmpty = !isLoading && accounts.length === 0 && investments.length === 0;

  // Compute asset/liability macro bar breakdown
  const macroItems = useMemo(() => {
    if (!s) return [];
    const total = Math.max(1, (s.totalAssets || 0) + (s.totalLiabilities || 0));
    const assetPct = Math.round(((s.totalAssets || 0) / total) * 100);
    const liabPct = 100 - assetPct;
    return [
      {
        id: 'assets',
        name: 'Assets',
        amount: s.totalAssets || 0,
        pct: assetPct,
        color: theme.colors.secondary,
      },
      {
        id: 'liabilities',
        name: 'Liabilities',
        amount: s.totalLiabilities || 0,
        pct: liabPct,
        color: theme.colors.rose,
      },
    ];
  }, [s, theme]);

  const equityRatio = useMemo(() => {
    if (!s || s.totalAssets <= 0) return 100;
    const ratio = Math.round((s.netWorth / s.totalAssets) * 100);
    return Math.max(0, Math.min(100, ratio));
  }, [s]);

  return (
    <View style={styles.root}>
      <AppHeaderBar
        title="BudgetBrain"
        subtitle="Net Worth & Holdings"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
      >
        {isLoading || !data || !s ? (
          <NetWorthSkeleton />
        ) : (
          <>
            {/* Wealth Hero Bento Card */}
            <View style={styles.heroCard}>
              <LinearGradient
                colors={['rgba(14, 165, 233, 0.14)', 'rgba(78, 222, 163, 0.08)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              <View style={styles.heroGlowCircle} pointerEvents="none" />

              <View style={styles.heroHeaderRow}>
                <View style={styles.heroTitleRow}>
                  <View style={styles.heroIconPod}>
                    <AppIcon name="netWorth" size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.heroLabel}>Total Net Worth</Text>
                </View>
                <View style={styles.equityBadge}>
                  <View style={styles.equityDot} />
                  <Text style={styles.equityBadgeText}>{equityRatio}% Equity</Text>
                </View>
              </View>

              <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {formatCurrency(s.netWorth, currency)}
              </Text>

              {/* Assets vs Liabilities Breakdown Bar */}
              <View style={styles.macroWrap}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroLabel}>Distribution</Text>
                  <Text style={styles.macroDetail}>
                    Assets vs Liabilities
                  </Text>
                </View>
                <SegmentedMacroBar items={macroItems} currency={currency} showLegend={false} />
              </View>
            </View>

            {/* 2x2 Bento Metric Grid */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <BentoCard
                  title="Total Assets"
                  value={formatCurrency(s.totalAssets, currency)}
                  subtitle="Investments & Cash"
                  accentColor={theme.colors.secondary}
                  icon="trendingUp"
                  style={styles.metricBento}
                />
              </View>
              <View style={styles.gridCol}>
                <BentoCard
                  title="Total Liabilities"
                  value={formatCurrency(s.totalLiabilities, currency)}
                  subtitle="Credit & Borrowings"
                  accentColor={theme.colors.rose}
                  icon="expense"
                  style={styles.metricBento}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <BentoCard
                  title="Liquid Cash"
                  value={formatCurrency(s.bankBalance, currency)}
                  subtitle="Bank & Wallets"
                  accentColor={theme.colors.primary}
                  icon="wallet"
                  onPress={() => router.push('/accounts')}
                  style={styles.metricBento}
                />
              </View>
              <View style={styles.gridCol}>
                <BentoCard
                  title="Investments"
                  value={formatCurrency(s.investmentValue, currency)}
                  subtitle="Stocks, Funds & Metals"
                  accentColor={theme.colors.violet}
                  icon="chart"
                  onPress={() => router.push('/investments')}
                  style={styles.metricBento}
                />
              </View>
            </View>

            {isEmpty ? (
              <EmptyState
                icon="netWorth"
                title="Nothing tracked yet"
                subtitle="Add accounts and investments to see your complete net worth picture"
                action="Add account"
                onAction={() => router.push('/accounts')}
                secondaryAction="View investments"
                onSecondaryAction={() => router.push('/investments')}
              />
            ) : (
              <View style={styles.holdingsSection}>
                <GroupedCard title="Accounts & Balances">
                  {accounts.length ? (
                    accounts.map((acc, i) => (
                      <ListRow
                        key={acc.id}
                        icon="wallet"
                        label={acc.name}
                        subtitle={`${acc.type.replace(/_/g, ' ')} · ${acc.institution ?? '—'}`}
                        value={formatCurrency(Number(acc.balance), currency)}
                        onPress={() => router.push('/accounts')}
                        isLast={i === accounts.length - 1}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon="wallet"
                      title="No accounts yet"
                      subtitle="Add bank accounts and credit cards to track liquid net worth"
                      action="Manage accounts"
                      onAction={() => router.push('/accounts')}
                    />
                  )}
                </GroupedCard>

                <GroupedCard title="Investment Holdings">
                  {investments.length ? (
                    investments.map((inv, i) => (
                      <ListRow
                        key={inv.id}
                        icon="chart"
                        label={inv.name}
                        subtitle={`${inv.type.replace(/_/g, ' ')} · ${inv.gainLoss >= 0 ? '+' : ''}${formatCurrency(inv.gainLoss, currency)}`}
                        value={formatCurrency(inv.currentValue, currency)}
                        onPress={() => router.push('/investments')}
                        isLast={i === investments.length - 1}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon="chart"
                      title="No investments yet"
                      subtitle="Track equity, funds, commodities, and deposits"
                      action="Manage investments"
                      onAction={() => router.push('/investments')}
                    />
                  )}
                </GroupedCard>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: 80,
    },
    heroCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 22,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
      marginBottom: t.spacing.md,
    },
    heroGlowCircle: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(14, 165, 233, 0.08)',
    },
    heroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    heroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    heroIconPod: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroLabel: {
      ...t.typography.label,
      color: t.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    equityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.12)' : t.colors.secondaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(78, 222, 163, 0.25)' : 'transparent',
    },
    equityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.secondary,
    },
    equityBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    heroValue: {
      fontSize: 34,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -1,
      lineHeight: 42,
      marginVertical: 6,
    },
    macroWrap: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    macroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    macroLabel: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    macroDetail: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    gridRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    gridCol: {
      flex: 1,
    },
    metricBento: {
      marginBottom: 0,
    },
    holdingsSection: {
      marginTop: t.spacing.sm,
      gap: t.spacing.md,
    },
  });
}
