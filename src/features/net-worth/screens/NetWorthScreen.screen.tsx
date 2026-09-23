import { useCallback, useMemo } from 'react';
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
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { createStyles } from './NetWorthScreen.styles';

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

export function NetWorthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottomSafe = useBottomSafeInset();
  // ListRow is memoized — a fresh closure per row here would defeat that for every row.
  const goToAccounts = useCallback(() => router.push('/accounts'), [router]);
  const goToInvestments = useCallback(() => router.push('/investments'), [router]);
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomSafe + theme.spacing.xl }]}
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
                        onPress={goToAccounts}
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
                        onPress={goToInvestments}
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

