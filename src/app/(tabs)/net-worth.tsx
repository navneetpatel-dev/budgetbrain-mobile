import { useMemo } from 'react';
import { StyleSheet, Text, RefreshControl, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import {
  Card,
  SummaryCard,
  ScreenLoader,
  StickyHeaderScreen,
  ScreenSection,
  ResponsiveGrid,
  FeatureHeader,
} from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
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
  const { screenPaddingX } = useResponsive();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthData>('/net-worth'),
  });

  if (isLoading) {
    return <ScreenLoader />;
  }

  const s = data?.summary;
  const currency = s?.currency ?? 'INR';

  return (
    <StickyHeaderScreen
      header={
        <FeatureHeader
          eyebrow="WEALTH"
          title="Net Worth"
          subtitle="Assets, liabilities & investments"
        />
      }
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
      contentContainerStyle={{ paddingHorizontal: screenPaddingX }}
    >
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[theme.colors.primary + '28', theme.colors.gradientEnd + '18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.heroLabel}>TOTAL NET WORTH</Text>
        <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {formatCurrency(s?.netWorth ?? 0, currency)}
        </Text>
        <Text style={styles.heroCurrency}>{currency}</Text>
      </View>

      <ResponsiveGrid style={styles.grid}>
        <SummaryCard title="Assets" amount={formatCurrency(s?.totalAssets ?? 0, currency)} color={theme.colors.success} icon="income" />
        <SummaryCard title="Liabilities" amount={formatCurrency(s?.totalLiabilities ?? 0, currency)} color={theme.colors.danger} icon="expense" />
        <SummaryCard title="Bank Balance" amount={formatCurrency(s?.bankBalance ?? 0, currency)} icon="wallet" />
        <SummaryCard title="Investments" amount={formatCurrency(s?.investmentValue ?? 0, currency)} color={theme.colors.primary} icon="chart" />
      </ResponsiveGrid>

      <ScreenSection noPadding>
        <Text style={styles.sectionLabel}>ACCOUNTS</Text>
        {data?.accounts?.length ? (
          data.accounts.map((acc) => (
            <Card key={acc.id} style={styles.item}>
              <Text style={styles.itemName}>{acc.name}</Text>
              <Text style={styles.itemMeta}>{acc.type.replace('_', ' ')} · {acc.institution ?? '—'}</Text>
              <Text style={[styles.itemAmount, acc.type === 'credit_card' && styles.debt]}>
                {formatCurrency(Number(acc.balance), currency)}
              </Text>
            </Card>
          ))
        ) : (
          <Text style={styles.empty}>Add bank or credit card accounts to track net worth</Text>
        )}

        <Text style={[styles.sectionLabel, styles.sectionGap]}>INVESTMENTS</Text>
        {data?.investments?.length ? (
          data.investments.map((inv) => (
            <Card key={inv.id} style={styles.item}>
              <Text style={styles.itemName}>{inv.name}</Text>
              <Text style={styles.itemMeta}>{inv.type.replace('_', ' ')}</Text>
              <Text style={styles.itemAmount}>{formatCurrency(inv.currentValue, currency)}</Text>
              <Text style={[styles.gainLoss, inv.gainLoss >= 0 ? styles.gain : styles.loss]}>
                {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss, currency)}
              </Text>
            </Card>
          ))
        ) : (
          <Text style={styles.empty}>No investments tracked yet</Text>
        )}
      </ScreenSection>
    </StickyHeaderScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    heroWrap: {
      alignItems: 'center',
      paddingVertical: t.spacing.lg,
      paddingHorizontal: t.spacing.lg,
      borderRadius: t.radii.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
      marginBottom: t.spacing.sm,
    },
    heroLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: t.colors.textSecondary,
    },
    heroValue: {
      ...t.typography.amountLg,
      color: t.colors.text,
      marginTop: 6,
      textAlign: 'center',
    },
    heroCurrency: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: 4,
      fontWeight: '600',
    },
    grid: { marginBottom: t.spacing.sm },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.9,
      color: t.colors.textTertiary,
      marginBottom: t.spacing.sm,
    },
    sectionGap: { marginTop: t.spacing.md },
    item: { marginBottom: t.spacing.sm },
    itemName: { ...t.typography.titleSm, color: t.colors.text },
    itemMeta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { ...t.typography.amount, color: t.colors.text, marginTop: 6 },
    debt: { color: t.colors.danger },
    gainLoss: { ...t.typography.caption, marginTop: 4, fontWeight: '600' },
    gain: { color: t.colors.success },
    loss: { color: t.colors.danger },
    empty: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginBottom: t.spacing.md },
  });
}
